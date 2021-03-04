import React, { useEffect } from 'react';

import { Environment, Host, IResolver } from "fesoa-bridge";

import logo from './logo.svg';
import './App.css';

const clientSiteUrl = "http://localhost:3001";
const shareStyling = {
  width: "800px",
  height: "300px",
  marginBottom: "10px",
  border: "1px solid lightgrey",
  display: "inline-block",
};


function App() {
  useEffect(() => {
    setupIframeDemo();
    // setupDivDemo();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Welcome to Bridge demo</h1>
        <p>Host Origin: {window.location.origin}</p>
      </header>
      <br />
      <div id="place-holder-for-iframe" style={shareStyling} />
      <br />
      <div id="place-holder-for-div" style={shareStyling} />
    </div>
  );
}

export default App;

function setupIframeDemo(): void {
  const iframeElement: HTMLIFrameElement = document.createElement("iframe");
  iframeElement.src = clientSiteUrl;
  iframeElement.width = "100%";
  iframeElement.height = "100%";

  iframeElement.onload = async (event: Event) => {
    await setupHost("IFRAME", iframeElement.contentWindow as Environment, clientSiteUrl);
  };

  const containerElement = document.getElementById("place-holder-for-iframe") as HTMLDivElement;
  containerElement.appendChild(iframeElement);
}

async function setupDivDemo(): Promise<void> {
  const response = await fetch(clientSiteUrl);
  const content = await response.text();
  const pageFragment = document.createRange().createContextualFragment(content);
  const scriptElementList = pageFragment.querySelectorAll("script");

  const scriptPromises: Promise<void>[] = [];
  for (let idx = 0; idx < scriptElementList.length; idx++) {
    const scriptElement = scriptElementList[idx];
    scriptPromises.push(addScriptToDOM(scriptElement.src.replace("http://localhost:3000", clientSiteUrl)));
    (scriptElement.parentNode as Node).removeChild(scriptElement);
  }

  const containerElement = document.getElementById("place-holder-for-div") as HTMLElement;
  containerElement.appendChild(pageFragment);
  await Promise.all(scriptPromises);

  const divWindow: any = {
    postMessage: function () {
      window.postMessage.apply(window, arguments as any);
    },
  };

  await setupHost("DIV", divWindow, window.location.origin);
}

function addScriptToDOM(scriptSrc: string): Promise<void> {
  return new Promise(resolve => {
    if (document.body.querySelectorAll(`script[src="${scriptSrc}"]`).length > 0) {
      resolve();
    }
    const script = document.createElement("script") as HTMLScriptElement;
    script.src = scriptSrc;
    script.async = false;
    script.onload = (event: Event) => {
      resolve();
    };
    document.body.appendChild(script);
  });
}

class HostSampleResolver implements IResolver {
  public name: string = "HostSampleResolver";

  public echo(inputs: { message: string }, from: string): Promise<any> {
    return new Promise((resolver) => {
      setTimeout(() => {
        resolver({ data: `echo from host: ${inputs.message}` });
      }, 500);
    });
  }
}

async function setupHost(name: string, client: Environment, clientOrigin: string) {
  const host = new Host(window, client, clientOrigin);
  host.registerResolver(new HostSampleResolver());
  await host.setup()
  console.log(`Host ===> ${name}: channel opened.`);

  const response = await host.invokeResolver<string>("ClientSampleResolver", "echo", { message: "message from host" }, "");
  console.log(`Host ===> RESPONSE from client > ${JSON.stringify(response)}`);
}