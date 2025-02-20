import {useState, useEffect, useRef, useCallback} from "react";
import axios from "axios";
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; 

export default function ExplorePanel({exploreCaption,exploreData}){
  
  return (
    <>
      <div className="explore-panel">
        <span className="explore-caption" >{exploreCaption} <ChevronRightIcon/> </span>
        <div className="explore-carousel">
          
        </div>
      </div>
    </>
  )
}


