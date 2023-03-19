import logo from './logo.svg';
import './App.css';

import { MyComponent } from './TestPdf';

import { Document, Page, pdfjs } from "react-pdf";

import { useParams, BrowserRouter, Routes, Route } from 'react-router-dom'

function Comp(props) {
  const params = useParams();
  return (
    <MyComponent 
      //file='Effective Java, Third Edition-pages-1-12.pdf'
      file={`${process.env.REACT_APP_CLOUD_URL}/${params.bookId}/${params.bookId}.pdf`}
      pageIndexBegin={Number.parseInt(params.pageIndexBegin)}
      pagesCount={Number.parseInt(params.pagesCount)} 
    />
  )
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path='/:bookId/:pageIndexBegin/:pagesCount' 
            element={ <Comp /> }
          />
        </Routes>
      </BrowserRouter>
    </div>

    
  );
}

export default App;
