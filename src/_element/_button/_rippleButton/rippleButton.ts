import Button from "./../button";

export default abstract class RippleButton extends Button {
  private ripples: HTMLElement;
  private wave: HTMLElement;
    constructor(activationCallback?: Function, enabled?: boolean, focusOnHover?: boolean, tabIndex?: number) {
      super((e) => {
        this.initRipple(e);
      }, enabled, focusOnHover, tabIndex);
      this.addActivationCallback(activationCallback);

      this.wave = ce("button-wave");

      this.ripples = ce("button-waves");
      this.sra(this.ripples);
    }
    public initRipple(e: MouseEvent | KeyboardEvent | "center") {
      
      let r = this.wave.cloneNode() as Element;
      this.ripples.append(r);

      let fadeAnim = async () => {
        try {
          await r.anim({opacity: 0}, {duration: 400});  
        } catch (error) {
          // should not be too bad
        }
        
        r.remove();
      }

      let fadeisok = () => {
        if (rdyToFade) fadeAnim();
        else rdyToFade = true;
      }

      let x: number;
      let y: number;


      if (e instanceof MouseEvent) {
        let offset = this.absoluteOffset();
        x = e.pageX - offset.left - r.width() / 2;
        y = e.pageY - offset.top - r.height() / 2;

        this.on("mouseup", fadeisok, {once: true});
        this.on("mouseout", fadeisok, {once: true});
      }
      else {
        x = this.width() / 2 - r.width() / 2;
        y = this.height() / 2 - r.height() / 2;

        //fadeOut
        this.on("keyup", fadeisok, {once: true});
        this.on("blur", fadeisok, {once: true});
      }
      r.css({
         marginTop: y,
         marginLeft: x
      });
      let rdyToFade = false;
      r.anim([{transform: "scale(0)", offset: 0}, {transform: "scale(" + (this.width() / 25 * 2.2) + ")"}], {duration: 350, easing: "linear"}).then(() => {
        if (rdyToFade) fadeAnim();
        else rdyToFade = true;
      });
    }
    stl() {
      return super.stl() + require('./rippleButton.css').toString();
    }
    pug() {
      return super.pug() + require("./rippleButton.pug").default
    }
}
