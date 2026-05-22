import { useEffect, useRef } from "react"
export default function Marquee() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() =>{
      const track = trackRef.current!;
      
    const text = "🔥 Cosmo People's Choice vào thẳng TOP 10";


    const span = document.createElement("span");
    span.innerText = text;
    track.appendChild(span);
    while (track.scrollWidth < window.innerWidth*2) {
      track.appendChild(span.cloneNode(true));
    }
    track.innerHTML += track.innerHTML;
  }

    , []);
  return (
  
    <div className="w-full overflow-hidden bg-white border-b">
    <div className="relative flex whitespace-nowrap">
   
      <div className="flex w-max animate-marquee gap-10 py-2 text-red-500 font-medium" ref={trackRef}></div>
    </div>
    </div>
  );
}