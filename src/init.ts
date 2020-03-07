import global from "./global"




export async function init() {
  await global()
  
  const main = (await import("./main")).default
  main()
}
  
  


