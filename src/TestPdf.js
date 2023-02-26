import React, { useState, useEffect, useRef, createRef, useCallback } from 'react';
import './TestPdf.css';

import { Document, Page, pdfjs  } from "react-pdf";

import { Button } from '@mui/material/Button';
import { IconButton, TextField, Divider } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LayersIcon from '@mui/icons-material/Layers';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Search as SearchIcon } from '@mui/icons-material';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';

const TOOL_BAR_HEIGHT = '5vh'

function isPositiveInteger(n) {
  return n >>> 0 === parseFloat(n);
}

function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();

  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
}

function highlightPattern(text, pattern) {
  return text.replace(pattern, (value) => `<mark>${value}</mark>`)
}

export function MyComponent() {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchPageNumber, setSearchPageNumber] = useState(1);
  const [counter, setCounter] = useState(0)

  const [numPages, setNumPages] = useState(0)

  //const canvasRefs = []
  const [previews, setPreviews] = useState([])
  const [pages, setPages] = useState([])
  const [renderedPageCanvasRefs, setRenderedPageCanvasRefs] = useState([])

  const [searchText, setSearchText] = useState('')

  const [pdfPagesData, setPdfPagesData] = useState([])

  const [textSearchTypingTimeout, setTextSearchTypingTimeout] = useState(null)

  const componentRef = useRef({});
  const { current: self } = componentRef;

  const rerender = () => {
    setCounter(counter + 1)
  }

  const setDisplayPageNumber = (v) => {
    setPageNumber(v)
    setSearchPageNumber(v)
    onSearchText(self.searchText, v)
  }

  // return lines contains text
  const searchTextInPage = async (page, text) => {
    if (!page.lines) {
      const lines = await page.getTextContent()
      page.lines = lines
    }

    const ret = []
    const lines = page.lines.items
    for (const line of lines) {
      const str = line.str
      if (str.indexOf(text) != -1) {
        ret.push(line)
      }
    }

    return ret
  }

  const highlightTextRegion = (pageIndex, lines) => {
    if (!self.rects) {
      self.rects = []
      for (let i = 0; i < 100; i++) {
        const newDiv = document.createElement('div')
        Object.assign(newDiv.style,
          {
            position: 'absolute',
            width: '200px',
            height: '50px',
            backgroundColor: 'red',
            opacity: 0.5,
            visibility: 'hidden'
          }
        )
        self.rects.push(newDiv)
        document.body.appendChild(newDiv)
      }
    }

    if (!self.rect) {
      //const newDiv = document.createElement("div");
      self.rect = self.rects[0]
    }

    console.log(self.pagesRef[pageIndex].current.pageElement.current.appendChild(self.rect));

    const line = lines[0]

    self.rect.style.visibility = 'visible'
    self.rect.style.bottom = line.transform[5] + 'px'
    self.rect.style.left = line.transform[4] + 'px'
    self.rect.style.height = line.height + 'px'
    self.rect.style.width = line.width + 'px'
  }

  const onSearchText = async (text, pageNumber) => {
    if (textSearchTypingTimeout) {
      clearTimeout(textSearchTypingTimeout)
    }

    self.searchText = text

    if (text == '') {
      setTextSearchTypingTimeout(null)
      setSearchText(text)
      return
    }

    setTextSearchTypingTimeout(
      setTimeout(async () => {
        const startPageIndex = pageNumber - 1
        console.log(startPageIndex)
        const ret = await searchTextInPage(pdfPagesData[startPageIndex], text)
        console.log(ret)

        if (ret.length != 0) {
          highlightTextRegion(startPageIndex, ret)
        }
      }, 500)
    )

    setSearchText(text)
  }

  const onDocumentLoadSuccess = (docs) => {
    docs.getPage(2).then((page) => {
      page.getTextContent().then((text) => {
        console.log(text)
      })
    })

    setNumPages(docs.numPages)

    if (pages.length === 0) {
      const displayPages = []
      const previewPages = []

      let renderedPreviewsPage = []
      let renderedPageCanvasRefs_ = []

      self.pagesRef = []

      for (let i = 0; i < docs.numPages; i++) {
        renderedPreviewsPage.push(
          null
        )
        renderedPageCanvasRefs_.push(createRef(null))
        pdfPagesData.push(null)

        self.pagesRef.push(createRef(null))
      }

      setRenderedPageCanvasRefs(renderedPageCanvasRefs_)

      for (let i = 0; i < docs.numPages; i++) {
        const ref = renderedPageCanvasRefs_[i]

        displayPages.push(
          <div
            style={{
              borderBottom: '5px solid lightgray'
            }}
          >
            <Page
              style={{
                display: 'flex',
                justifyContent: 'center'
              }}

              key={i}
              scale={1.0}
              devicePixelRatio={2.0}
              pageNumber={i + 1} 
              renderTextLayer={false} 
              renderAnnotationLayer={false}
              canvasRef={ref}

              ref={self.pagesRef[i]}
              
              onRenderSuccess={(page) => {
                pdfPagesData[page._pageIndex] = page

                ref?.current?.toBlob((blob) => {
                  let temp = [...renderedPreviewsPage]

                  temp[page._pageIndex] = 
                    <div
                      className='TestPdf__previewImg'
                      onClick={
                        () =>  {
                          ref?.current?.scrollIntoView()
                          setDisplayPageNumber(page._pageIndex + 1)
                        }
                      }

                      ref={createRef(null)}
                    >
                      <img 
                        style={{
                          maxWidth: '95%'
                        }} 
                        key={i} 
                        src={URL.createObjectURL(blob)} 
                        alt="pdf preview" 
                        
                      />
                      <div className="TestPdf__previewImg_middle">
                      </div>
                    </div>
                  renderedPreviewsPage = temp
                  setPreviews(temp)
                });
              }}
            />
          </div>
        )
      }
  
      setPages(displayPages)
      //setPreviews(previewPages)
    }
    
  };

  {/* <Page
    scale={2.0}
    devicePixelRatio={2.0}
    pageNumber={1} 
    renderTextLayer={false} 
    renderAnnotationLayer={false}
    canvasRef={canvasRef}
    //onRenderSuccess={() => {
    //  canvasRef?.current?.toBlob((blob) => setThumb(URL.createObjectURL(blob)));
    //}}
  /> */}

  //const file = 'Effective Java, Third Edition.pdf'
  const file = 'Effective Java, Third Edition-pages-1-12.pdf'

  const MyDivider = (
    <Divider 
      style={{
        marginTop: '3px',
        height:'85%', 
        width: '25px', 
        marginRight: '15px', 
        display:'inline-block', 
        float: 'left',
      }}

      sx={{ 
        borderRightWidth: 2,
        borderRightColor: 'black'
      }}

      orientation='vertical' 
      flexItem  
    />
  )

  return (
    <>
      <div 
        className="tool_container" 
        style={{
          height: TOOL_BAR_HEIGHT,
          maxHeight: TOOL_BAR_HEIGHT,
          borderBottom: '1px solid lightgray'
        }}
      >
        <div
          style={{
            display: 'inline-block',
            float: 'left',
            width: '1vw',
            height: '5px'
          }}
        >

        </div>
        <div
          style={{
            display: 'inline-block',
            float: 'left',
            maxHeight: TOOL_BAR_HEIGHT
          }}
        >
          <IconButton
            sx={{
              width: TOOL_BAR_HEIGHT,
              height: TOOL_BAR_HEIGHT,
              borderRadius: 0,
              borderColor: "lightblue",
            }}
            disabled
            aria-label="save"
          >
            <MenuBookIcon sx={{ color: 'black' }} />
          </IconButton>
        </div>
        <div
          className="TextField-without-border-radius"
          style={{
            display: 'inline-block',
            float: 'left',
            borderRadius: 0,
          }}
        >
          <TextField
            value={searchPageNumber}
            inputProps={{
              style: {
                height: TOOL_BAR_HEIGHT,
                width: '100px',
                paddingBottom: 0,
                paddingTop: 0,
                fontSize: 20,
                textAlign: 'right'
              },
            }}
            variant="outlined"

            onChange={(e) => {
              const input = e.target.value

              if (input == '') {
                setSearchPageNumber('')
              }

              if (isPositiveInteger(input)) {
                const int = Number.parseInt(input)
                if (int > 0 && int <= numPages) {
                  setSearchPageNumber(int)
                }
              }
            }}

            onKeyDown={(e) => {
              if (e.keyCode == 13) {
                renderedPageCanvasRefs[searchPageNumber - 1]?.current?.scrollIntoView()
                previews[searchPageNumber - 1]?.ref?.current?.scrollIntoView()
                setDisplayPageNumber(searchPageNumber)
              }
            }}
          />

          <IconButton
            style={{
              color: 'black'
            }}
            sx={{
              height: TOOL_BAR_HEIGHT,
              borderRadius: 0,
              fontSize: 20
            }}
            disabled
            aria-label="save"
          > 
            / {numPages} pages
          </IconButton>
        </div>

        {MyDivider}

        <div
          className="TextField-without-border-radius"
          style={{
            display: 'inline-block',
            float: 'left',
            borderRadius: 0,
            paddingRight: '15px'
          }}
        >
          <IconButton
            sx={{
              width: TOOL_BAR_HEIGHT,
              height: TOOL_BAR_HEIGHT,
              borderRadius: 0,
              borderColor: "lightblue",
            }}
            disabled
            aria-label="save"
          >
            <SearchIcon sx={{ color: 'black' }} />
          </IconButton>

          <TextField
            value={searchText}
            placeholder='search text'
            inputProps={{
              style: {
                height: TOOL_BAR_HEIGHT,
                width: '150px',
                paddingBottom: 0,
                paddingTop: 0,
                fontSize: 20,
                textAlign: 'right'
              },
            }}
            variant="outlined"

            onChange={(e) => {
              const input = e.target.value
              onSearchText(input, pageNumber)
            }}
          />
        </div>

        {MyDivider}

        <div
          className="TextField-without-border-radius"
          style={{
            display: 'inline-block',
            float: 'left',
            borderRadius: 0,
          }}
        >
          <IconButton
            sx={{
              width: TOOL_BAR_HEIGHT,
              height: TOOL_BAR_HEIGHT,
              borderRadius: 0,
              borderColor: "lightblue",
            }}
            aria-label="save"
          >
            <PlayCircleFilledWhiteOutlinedIcon sx={{ color: 'black' }} />
          </IconButton>
        </div>
      </div>


      <div 
        style={{
          position: 'relative'
        }}
      >
        <div 
          style={{
            width: '20%',
            height: '94vh',
            float: 'left',
            overflowY: 'scroll',
            position: 'absolute',
            left: '0px',
            top: '0px',
            background: 'lightgray'
          }}
        >
          {previews}
        </div>
        
        <div 
          style={{
            display: 'inline-block',
            width: '80%',
            float: 'right',
            justifyContent: 'center',
            background: 'lightgray'
          }}
        >
          <div>
            <Document file={file} onLoadError={console.error} onLoadSuccess={onDocumentLoadSuccess}>
            <div 
              style={{
                overflowY: 'scroll',
                height: '94vh'
              }}

              onScroll={(event) => {
                const nextPageNumber = pageNumber
                const prevPageNumber = pageNumber - 2

                const nextPageView = renderedPageCanvasRefs[nextPageNumber]?.current.getBoundingClientRect()
                const prevPageView = renderedPageCanvasRefs[prevPageNumber]?.current.getBoundingClientRect()

                const curPageview = renderedPageCanvasRefs[pageNumber - 1]?.current.getBoundingClientRect()
                const view = event.currentTarget.getBoundingClientRect()

                let lastPageNumber = pageNumber - 1

                const halfHeightY = view.height / 2.0

                if (prevPageView) {
                  if (prevPageView.bottom > halfHeightY) {
                    lastPageNumber = prevPageNumber
                  }
                }

                if (nextPageView) {
                  if (nextPageView.top < halfHeightY) {
                    lastPageNumber = nextPageNumber
                  }
                }

                lastPageNumber++
                if (lastPageNumber != pageNumber) {
                  setDisplayPageNumber(lastPageNumber)
                }
              }}
            >
              {pages}
            </div>
            </Document>
          </div>
        </div>
      </div>
    </>
  );
}