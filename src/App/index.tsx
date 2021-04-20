import { FC } from 'react';
import { ThemeProvider, RMWCProvider, DialogQueue } from 'rmwc';
// import '@rmwc/button/styles';
// import '@rmwc/checkbox/styles';
// import '@rmwc/linear-progress/styles';
// import '@rmwc/dialog/styles';
// import '@rmwc/slider/styles';
import { theme, uploadHIC, useGlobalState, dialogQueue, globalStateBackend } from '../util';
import { WCOverlay, HIC } from './components';

const App: FC = () => {
  const [hic, setHIC] = useGlobalState('hic');
  return (
    <ThemeProvider options={theme}>
      {/* Add any desired options to the RMWCProvider */}
      <RMWCProvider>
        <DialogQueue dialogs={dialogQueue} />
        {!hic ? <HIC onSubmit={blob => {
          setHIC(true);
          if (blob) {
            uploadHIC(blob).then(success => {
              if (!success) {
                globalStateBackend.set('hic', false);
                alert({
                  title: "We didn't get your HIC",
                  body: "We failed to upload your HIC form. Make sure to re-do it when you reload.",
                });
              }
            })
          }
        }} /> : <WCOverlay />}
      </RMWCProvider>
    </ThemeProvider>
  );
};

export default App;
