import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Client, IResolver } from 'fesoa-bridge';

class ClientSampleResolver implements IResolver {
  public name: string = "ClientSampleResolver";

  public echo(inputs: { message: string }, from: string): Promise<any> {
    return new Promise((resolver) => {
      setTimeout(() => {
        resolver({ data: `echo from client (${window.origin}): ${inputs.message}` });
      }, 500);
    });
  }
}

const setupClient = async () => {
  const client = new Client(window);
  client.registerResolver(new ClientSampleResolver());
  await client.setup();

  console.log(`Client (${window.origin}) ===> Client: connected.`);

  const response = await client.invokeResolver<string>("HostSampleResolver", "echo", { message: "message from client" }, "");
  console.log(`Client (${window.origin}) ===> RESPONSE from host > ${JSON.stringify(response)}`);
};

const main = async () => {
  await setupClient();
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('client-root')
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
};

main();
