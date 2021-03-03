import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Client, IResolver } from 'fesoa-bridge';

class ClientSampleResolver implements IResolver {
  public name: string = "ClientSampleResolver";

  public echo(message: string, from: string): Promise<string> {
    return new Promise((resolver) => {
      setTimeout(() => {

        console.log(`===> resolving request from ${from}, message: ${message}`);
        resolver(`echo from client: ${message}`);
      }, 500);
    });
  }
}

const setupClient = async () => {
  const client = new Client(window);
  client.registerResolver(new ClientSampleResolver());
  await client.setup();

  console.log(`===> Client: connected.`);

  const response = await client.invokeResolver<string>("HostSampleResolver", "echo", "message from client" as any, "");
  console.log(`===> RESPONSE from client: ${response}`);
};

const main = async () => {
  await setupClient();
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
};

main();
