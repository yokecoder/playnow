import ChevronRightIcon from '@mui/icons-material/ChevronRight';



export default function ExploreSection({caption, children}){
  
  return (
    <div className="category">
      <div className="title"> <span>{caption}</span> <ChevronRightIcon className="icon-btn"/> </div>
        <div className="carousel">
          { children }
        </div>
    </div>
  )
}


