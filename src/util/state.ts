import createState, { LocalStorageBackend } from 'react-universal-state';

const backend = new LocalStorageBackend<{
  hic: boolean;
  rid: string;
}>('gs');

const useGlobalState = createState({
  hic: false,
  rid: Math.random().toString(36).slice(2).padEnd(12, '0')
},  backend).hook;

export default useGlobalState;
export { backend };