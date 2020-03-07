import * as decodeUri from "fast-decode-uri-component"


const commonTitle = "Xcenic";
const commonTitleSeperator = " - "
const argData = "internal";

const titleElement = document.querySelector("title")

let dir = "/";
export let domainIndex: string[] = [];

//First capital
export function fc(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getCurrentSubDomainPath() {
  return decodeUri(document.location.pathname)
}

function parseUrlToDomainIndex() {
  domainIndex = getCurrentSubDomainPath().split(dir)
  domainIndex.remove("");
}
parseUrlToDomainIndex()

function updateTitle() {
  let subtitle = domainIndex.Replace((e) => {
    return fc(e)
  }).join(" ")
  let title = commonTitle
  if (subtitle.length !== 0) title += commonTitleSeperator + subtitle
  titleElement.innerHTML = title
  return title
}
updateTitle()

function replace(subdomain: string, badKey: string, goodKey: string, preventWarning: boolean): string {
  if (subdomain.includes(badKey)) {
    let oldSubdomain = subdomain;
    subdomain = subdomain.replace(badKey, goodKey)
    if (preventWarning) console.warn("Found at least one \"" + badKey + "\" in given subdomain: \"" + oldSubdomain + "\". Replacing it with \"" + goodKey + "\"; Resulting in \"" + subdomain + "\".")
  }
  return subdomain
}


export function set(level: number, subdomain: string, push: boolean = false, preventWarning = false) {


  subdomain = replace(subdomain, "/", "-", preventWarning)
  subdomain = replace(subdomain, " ", "_", preventWarning)

  let length = domainIndex.length;
  if (length < level || level < 0) {
    if (preventWarning) console.warn("Unexpected index: " + level + ". Replacing it with " + length + ".")
    level = length
  }
  domainIndex.splice(level+1);
  if (domainIndex[level] === subdomain) return;
  domainIndex[level] = subdomain;
  let domain = dir + domainIndex.join(dir)
  

  
  
  if (domain !== getCurrentSubDomainPath()) {
    let title = updateTitle()

    let args: [any, string, string] = [argData, title, domain]
    if (push) history.pushState(...args);
    else history.replaceState(...args);
  }
  

  
}



export function get(domainLevel: number, defaultDomain: string, subscription: (domainFragment: string) => void) {
  ls.add(() => {
    let domain = domainIndex[domainLevel]
    subscription((domain !== undefined) ? domain : defaultDomain)
  })

  let domain = domainIndex[domainLevel]
  return (domain !== undefined) ? domain : defaultDomain
}


let ls = []

window.onpopstate = function(e) {
  parseUrlToDomainIndex()
  updateTitle()

  ls.ea((f) => {
    f()
  })
  
};
