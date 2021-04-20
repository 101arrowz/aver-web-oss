import 'regenerator-runtime/runtime';
import { render } from 'react-dom';
import App from './App';

if (process.env.NODE_ENV == 'production') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.ts');
  }
}

render(<App />, document.getElementById('root'));
