import React from 'react';
import ReactDOM from 'react-dom/client';

import Router from './routes';
import './styles/index.css';

// Considering redux a service which provides a centralized state which can be accessed
// through any component, we need to add it as a parent for all components. (Hence: <Provider/>)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>,
);
