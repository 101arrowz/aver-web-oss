/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

// This file is autogenerated.


import {registerKernel} from '@tensorflow/tfjs-core/dist/base';
import '@tensorflow/tfjs-core/dist/base_side_effects';
export * from '@tensorflow/tfjs-core/dist/base';
export * from '@tensorflow/tfjs-converter';

//backend = webgl
export * from '@tensorflow/tfjs-backend-webgl/dist/base';
import {fusedConv2DConfig as FusedConv2D_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/FusedConv2D';
registerKernel(FusedConv2D_webgl);
import {maxPoolConfig as MaxPool_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/MaxPool';
registerKernel(MaxPool_webgl);
import {sigmoidConfig as Sigmoid_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Sigmoid';
registerKernel(Sigmoid_webgl);
import {castConfig as Cast_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Cast';
registerKernel(Cast_webgl);
import {gatherV2Config as GatherV2_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/GatherV2';
registerKernel(GatherV2_webgl);
import {concatConfig as Concat_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Concat';
registerKernel(Concat_webgl);
import {prodConfig as Prod_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Prod';
registerKernel(Prod_webgl);
import {reshapeConfig as Reshape_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Reshape';
registerKernel(Reshape_webgl);
import {packConfig as Pack_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Pack';
registerKernel(Pack_webgl);
import {batchMatMulConfig as BatchMatMul_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/BatchMatMul';
registerKernel(BatchMatMul_webgl);
import {addConfig as Add_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Add';
registerKernel(Add_webgl);
import {_fusedMatMulConfig as _FusedMatMul_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/_FusedMatMul';
registerKernel(_FusedMatMul_webgl);
import {softmaxConfig as Softmax_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Softmax';
registerKernel(Softmax_webgl);
import {identityConfig as Identity_webgl} from '@tensorflow/tfjs-backend-webgl/dist/kernels/Identity';
registerKernel(Identity_webgl);

//backend = cpu
export * from '@tensorflow/tfjs-backend-cpu/dist/base';
import {fusedConv2DConfig as FusedConv2D_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/FusedConv2D';
registerKernel(FusedConv2D_cpu);
import {maxPoolConfig as MaxPool_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/MaxPool';
registerKernel(MaxPool_cpu);
import {sigmoidConfig as Sigmoid_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Sigmoid';
registerKernel(Sigmoid_cpu);
import {castConfig as Cast_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Cast';
registerKernel(Cast_cpu);
import {gatherV2Config as GatherV2_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/GatherV2';
registerKernel(GatherV2_cpu);
import {concatConfig as Concat_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Concat';
registerKernel(Concat_cpu);
import {prodConfig as Prod_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Prod';
registerKernel(Prod_cpu);
import {reshapeConfig as Reshape_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Reshape';
registerKernel(Reshape_cpu);
import {packConfig as Pack_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Pack';
registerKernel(Pack_cpu);
import {batchMatMulConfig as BatchMatMul_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/BatchMatMul';
registerKernel(BatchMatMul_cpu);
import {addConfig as Add_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Add';
registerKernel(Add_cpu);
import {_fusedMatMulConfig as _FusedMatMul_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/_FusedMatMul';
registerKernel(_FusedMatMul_cpu);
import {softmaxConfig as Softmax_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Softmax';
registerKernel(Softmax_cpu);
import {identityConfig as Identity_cpu} from '@tensorflow/tfjs-backend-cpu/dist/kernels/Identity';
registerKernel(Identity_cpu);

// import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
// import wasmBackend from 'url:@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm';
// import wasmBackendSIMD from 'url:@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-simd.wasm';
// import wasmBackendSIMDThreaded from 'url:@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-threaded-simd.wasm';
// setWasmPaths({
//   'tfjs-backend-wasm.wasm': wasmBackend,
//   'tfjs-backend-wasm-simd.wasm': wasmBackendSIMD,
//   'tfjs-backend-wasm-threaded-simd.wasm': wasmBackendSIMDThreaded
// });

// //backend = wasm
// export * from '@tensorflow/tfjs-backend-wasm/dist/base';
// import {fusedConv2DConfig as FusedConv2D_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/FusedConv2D';
// registerKernel(FusedConv2D_wasm);
// import {maxPoolConfig as MaxPool_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/MaxPool';
// registerKernel(MaxPool_wasm);
// import {sigmoidConfig as Sigmoid_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Sigmoid';
// registerKernel(Sigmoid_wasm);
// import {castConfig as Cast_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Cast';
// registerKernel(Cast_wasm);
// import {gatherV2Config as GatherV2_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/GatherV2';
// registerKernel(GatherV2_wasm);
// import {concatConfig as Concat_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Concat';
// registerKernel(Concat_wasm);
// import {prodConfig as Prod_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Prod';
// registerKernel(Prod_wasm);
// import {reshapeConfig as Reshape_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Reshape';
// registerKernel(Reshape_wasm);
// import {packConfig as Pack_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Pack';
// registerKernel(Pack_wasm);
// import {batchMatMulConfig as BatchMatMul_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/BatchMatMul';
// registerKernel(BatchMatMul_wasm);
// import {addConfig as Add_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Add';
// registerKernel(Add_wasm);
// import {fusedMatMulConfig as _FusedMatMul_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/_FusedMatMul.js';
// registerKernel(_FusedMatMul_wasm);
// import {softmaxConfig as Softmax_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Softmax';
// registerKernel(Softmax_wasm);
// import {identityConfig as Identity_wasm} from '@tensorflow/tfjs-backend-wasm/dist/kernels/Identity';
// registerKernel(Identity_wasm);