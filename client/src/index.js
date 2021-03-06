import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

import ApolloProvider from './Apollo/ApolloProvider';
import { CartStateProvider } from './components/CartStateProvider';

ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider>
            <CartStateProvider>
                <App />
            </CartStateProvider>
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
