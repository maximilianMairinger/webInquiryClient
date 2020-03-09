import Element from "../element"
import clone from "tiny-clone"
import res from "./data"

let { defaultDelta, data } = res


let kB = (JSON.stringify(res).length / 1000) * 2
let kBit = kB * 8
let MBit = kBit / 1000

let timeMs = 0
data.ea((e) => {
  timeMs += e.delta !== undefined ? e.delta : defaultDelta
})
let totalSec = timeMs / 1000
let uploadSpeed = MBit / totalSec



console.log("Avg upload req: " + Math.round(uploadSpeed * 100) / 100 + "Mb/s")
console.log("Size: " + Math.round(kB * 10) / 10 + "kB")
console.log("Time: " + Math.round(totalSec * 10) / 10 + "s")
console.log("Entries: " + Math.round((data.length / 1000) * 100) / 100 + "k")
console.log(clone(res))



function click(x,y){
  var ev = document.createEvent("MouseEvent");
  var el = document.elementFromPoint(x,y);
  ev.initMouseEvent(
      "click",
      true /* bubble */, true /* cancelable */,
      window, null,
      x, y, 0, 0, /* coordinates */
      false, false, false, false, /* modifier keys */
      0 /*left*/, null
  );
  el.dispatchEvent(ev);
}

setTimeout(() => {
  click(10, 150)
  draw(10, 150)
}, 1000)

function draw(x: number, y: number) {
  let elem = document.createElement("div")
  elem.style.width = "10px"
  elem.style.height = "10px"
  elem.style.background = "yellow"
  elem.style.position = "absolute"
  elem.style.top = y + "px"
  elem.style.left = x + "px"
  elem.style.pointerEvents = "none"

  document.body.append(elem)


  setTimeout(() => {
    elem.remove()
  }, 2000)
}


export default class Site extends Element {
  private mouseElem = ce("mouse-dummy")
  constructor() {
    super()


    

    this.apd(this.mouseElem);


    

    setTimeout(() => {
      this.play()
    }, 100)
  }

  async play() {
    this.mouseElem.css({left: data.first.x, top: data.first.y})


    for (let i = 1; i < data.length; i++) {
      const entry = data[i];
      const lastEntry = data[i-1]

      entry.x = lastEntry.x + entry.x
      entry.y = lastEntry.y + entry.y
      
      await this.mouseElem.anim({left: entry.x, top: entry.y}, {duration: entry.delta === undefined ? defaultDelta : entry.delta, easing: "linear", fill: false})
    }
  }

  stl() {
    return require("./site.css").toString()
  }
  pug() {
    return require("./site.pug").default
  }
}

window.customElements.define('c-site', Site);