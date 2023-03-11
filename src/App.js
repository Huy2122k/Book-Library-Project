import logo from './logo.svg';
import './App.css';

import { MyComponent } from './TestPdf';

import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {
  return (
    <div className="App">
      <MyComponent 
        file='Effective Java, Third Edition-pages-1-12.pdf'
        pageIndexBegin={5}
        pagesCount={5}
      />
    </div>
  );
}

export default App;
