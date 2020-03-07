import Element from "./../element";
import { ElementList } from "extended-dom"

var emailValidationRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;



export default class Input extends Element {
  private placeholderElem: HTMLElement;
  private input: HTMLInputElement = ce("input");
  private isUp: boolean = false;
  private isFocused: boolean = false;
  private allElems: ElementList;

  private enterAlreadyPressed = false;

  private _type: "password" | "text" | "number" | "email";
  constructor(placeholder: string = "", type: "password" | "text" | "number" | "email" = "text", public submitCallback?: (value: string, e: KeyboardEvent) => void, value?: any, public customVerification?: (value?: string | number) => boolean) {
    super(false);
    
    this.type = type;

    this.placeholderElem = ce("input-placeholder");
    this.placeholder = placeholder;
    this.placeholderElem.on("click", () => {
      this.input.focus();
    });
    

    // ----- Validation start
    let listener = this.input.ls("input", () => {
      let valid = this.validate()

      if (valid) {
        this.showInvalidation(false)
        listener.disable()
      }
    }, false)

    this.input.on("blur", (e) => {
      let valid = this.validate()
      
      if (!valid) {
        this.showInvalidation(true)
        listener.enable()
      }
    });


    // ----- Validation end
  

    let mousedown = false
    this.input.on('mousedown', () => {
      mousedown = true
    });

    this.input.on("focus", (e) => {
      if (!mousedown) {
        if (this.input.value !== "") this.input.select()  
      }
    })
    this.input.on("blur", () => {
      mousedown = false
      this.enterAlreadyPressed = false
    })

    this.on("focus", () => {
      this.input.focus()
      this.placeHolderUp();
    });
    this.on("blur", () => {
      if (this.value === "") this.placeHolderDown();
    });
    
    this.input.on("keydown", (e) => {
      if (e.key === "Enter" && this.submitCallback !== undefined) if (!this.enterAlreadyPressed) {
        this.enterAlreadyPressed = true;
        this.submitCallback(this.value, e);
      }
    });
    this.input.on("keydown", (e: any) => {
      e.preventHotkey = "input";
    })
    this.input.on("keyup", ({key}) => {
      if (key === "Enter") {
        this.enterAlreadyPressed = false;
      }
    });

    this.on("focus", () => {
      this.isFocused = true;
    });
    this.on("blur", () => {
      this.isFocused = false;
    });


    this.apd(this.placeholderElem, this.input as any as HTMLElement);
    this.allElems = new ElementList(this.placeholderElem, this.input as any as HTMLElement);

    if (value !== undefined) this.value = value;
  }

  private isDisabled = false
  public disable() {
    if (this.isDisabled) return
    this.isDisabled = true
    this.allElems.addClass("disabled")
    let foc = this.isFocused
    this.input.disabled = true
    if (foc) this.focus()
    this.enterAlreadyPressed = false
  }

  public focus() {
    this.input.focus()
  }

  public enable() {
    if (!this.isDisabled) return
    this.isDisabled = false
    this.allElems.removeClass("disabled")
    this.input.disabled = false
    if (this.isFocused) this.input.focus()
  }

  private listeners: Map<(value: string, e: InputEvent) => void, (e: InputEvent) => void> = new Map()
  public onChange(f: (value: string, e: InputEvent) => void) {
    let inner = (e: InputEvent) => {
      f(this.value, e)
    }
    this.listeners.set(f, inner)
    this.input.on("input", inner)
  }
  public offChange(f: (value: string, e: InputEvent) => void) {
    this.input.off("input", this.listeners.get(f))
    this.listeners.delete(f)
  }


  public set placeholder(to: string) {
    this.placeholderElem.html(to);
  }
  public get placeholder(): string {
    return this.placeholderElem.html();
  }
  public set type(to: "password" | "text" | "number" | "email") {
    if (to === "password") {
      this.input.type = to;
    }
    else {
      this.input.type = "text";
    }
    this._type = to;
  }
  public get type(): "password" | "text" | "number" | "email" {
    return this._type;
  }
  public isValid(emptyAllowed: boolean = true) {
    let valid = this.validate();
    if (emptyAllowed) return valid;
    return this.value !== "" && valid;
  }
  public get value(): any {
    let v = this.input.value;
    if (this.type === "number") {
      return +v;
    }
    return v;
  }
  public set value(to: any) {
    this.input.value = to;
    this.alignPlaceHolder();
  }
  private validate() {
    let valid = true;
    if (this.type === "number") valid = !isNaN(this.value);
    else if (this.type === "email") valid = emailValidationRegex.test(this.value.toLowerCase());
    if (this.customVerification !== undefined) if (!this.customVerification(this.value)) valid = false;
    return valid;
  }
  private alignPlaceHolder() {
    if (this.value === "" && !this.isFocused) this.placeHolderDown("css");
    else this.placeHolderUp("css");
  }
  private async placeHolderUp(func: "anim" | "css" = "anim") {
    if (!this.isUp) {
      // This seems to be too complex for typescript. Maybe in thefuture the ts-ignore can be removed. Proof that it should work.
      // this.placeholder.css({marginLeft: "13px", marginTop: "10px", fontSize: "1em"})
      // this.placeholder.anim({marginLeft: "13px", marginTop: "10px", fontSize: "1em"})
      //@ts-ignore
      this.placeholderElem[func]({marginTop: "-1.2em", marginLeft: 0, fontSize: ".8em"});
      this.isUp = true;
      this.placeholderElem.css("cursor", "auto");
    }
  }
  private placeHolderDown(func: "anim" | "css" = "anim") {
    if (this.isUp) {
      //@ts-ignore
      this.placeholderElem[func]({marginLeft: "13px", marginTop: "10px", fontSize: "1em"});
      this.isUp = false;
      this.placeholderElem.css("cursor", "text");
    }
  }
  public showInvalidation(valid: boolean = true) {
    if (valid) {
      this.title = "Invalid input";
      this.allElems.addClass("invalid");
    }
    else {
      this.title = "";
      this.allElems.removeClass("invalid");
    }
  }
  static get observedAttributes() {
    return ["placeholder", "type", "value"];
  }
  stl() {
    return require('./input.css').toString();
  }
  pug() {
    return require("./input.pug").default
  }

}

window.customElements.define('c-input', Input);
