import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'
import reportWebVitals from './reportWebVitals'
import Router from './routes'

// Considering redux a service which provides a centralized state which can be accessed
// through any component, we need to add it as a parent for all components. (Hence: <Provider/>)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
