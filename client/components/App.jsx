import React from 'react';
import { render } from 'react-dom';

// Components
import Upload from './Upload.jsx';

const App = () => {
  return <Upload />;
};

render(<App />, document.getElementById('app'));

export default App;
