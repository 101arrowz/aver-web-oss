use actix::prelude::*;
use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web_actors::ws::{self, CloseCode, CloseReason};
use futures::StreamExt;
use std::{convert::TryInto, env::var, fs::{File, OpenOptions, create_dir, read_dir}, io::{prelude::*, BufWriter}, ops::Deref, path::Path, str::FromStr, sync::Mutex, time::{SystemTime, UNIX_EPOCH}};

struct SharedData {
    delta_file: File,
    hic_index: u32,
    hic_dir: String,
}

#[post("/hic")]
async fn hic(mut body: web::Payload, data: web::Data<Mutex<SharedData>>, raw_req: HttpRequest) -> impl Responder {
    let mut data = data.lock().unwrap();
    let mut writer = BufWriter::new(
        File::create(Path::new(&data.hic_dir).join(format!("{}-{}.png", data.hic_index, raw_req.connection_info().realip_remote_addr().unwrap()))).unwrap(),
    );
    data.hic_index += 1;
    while let Some(d) = body.next().await {
        if writer.write_all(&d.unwrap()).is_err() {
            return HttpResponse::InternalServerError();
        }
    }
    if writer.flush().is_err() {
        return HttpResponse::InternalServerError();
    }
    HttpResponse::Ok()
}

struct EmoDelta {
    data: web::Data<Mutex<SharedData>>,
    rid: Vec<u8>
}

impl Actor for EmoDelta {
    type Context = ws::WebsocketContext<Self>;
}

const EMODELTA_INVALID_ERR: &str = "Not two 32-bit floats in [0, 1]";

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for EmoDelta {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                ctx.pong(&msg);
            }
            Ok(ws::Message::Pong(_)) => {
                // NOP
            }
            Ok(ws::Message::Text(rid)) => {
                self.rid = Vec::from(rid.as_bytes());
                if self.rid.len() > 255 {
                    ctx.close(None);
                }
            },
            Ok(ws::Message::Binary(msg)) => {
                if msg.len() == 8 {
                    let pred = &msg.deref()[0..4];
                    let real = &msg.deref()[4..8];
                    if let Ok(raw_pred) = pred.try_into() {
                        let fpred = f32::from_le_bytes(raw_pred);
                        if fpred >= 0f32 && fpred <= 1f32 {
                            if let Ok(raw_real) = real.try_into() {
                                let freal = f32::from_le_bytes(raw_real);
                                if freal >= 0f32 && freal <= 1f32 {
                                    let mut buf = Vec::new();
                                    buf.push(self.rid.len() as u8);
                                    buf.extend_from_slice(&msg.deref()[0..8]);
                                    buf.extend_from_slice(&self.rid);
                                    buf.extend_from_slice(&(SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64).to_le_bytes());
                                    if self.data.lock().unwrap().delta_file.write_all(&buf).is_ok() {
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
                ctx.close(Some(CloseReason {
                    code: CloseCode::Policy,
                    description: Some(EMODELTA_INVALID_ERR.to_string()),
                }));
            }
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => ctx.stop(),
        }
    }
}

#[get("/")]
async fn index(
    req: HttpRequest,
    payload: web::Payload,
    data: web::Data<Mutex<SharedData>>,
) -> impl Responder {
    ws::start(EmoDelta {
        data,
        rid: Vec::new()
    }, &req, payload)
}

const SITE_LOC: &str = "https://aver.101arrowz.com";

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let db_dir = var("DB").unwrap_or_else(|_| "db".to_string());
    let _ = create_dir(&db_dir);
    let raw_data = Mutex::new(SharedData {
        delta_file: OpenOptions::new()
            .create(true)
            .append(true)
            .open(Path::new(&db_dir).join("deltas"))?,
        hic_index: read_dir(&db_dir).unwrap().count() as u32 - 1,
        hic_dir: db_dir,
    });
    let port = u16::from_str(&var("PORT").unwrap_or_else(|_| "8080".to_string())).unwrap();
    let data = web::Data::new(raw_data);
    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin(SITE_LOC);
        App::new()
            .wrap(cors)
            .app_data(data.clone())
            .service(hic)
            .service(index)
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
