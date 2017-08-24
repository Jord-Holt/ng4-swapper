import { trigger, state, animate, style, transition, AnimationTriggerMetadata } from '@angular/animations';

/*
 * Swapper is a simple facade meant to centralize the often required function of swapping components from a parent view.
 * Use this call when you have components serving as children to a parent component and require them to be toggled into and from the
 * view.
 */
export class Swapper {

    private swappableComponents: Array<any> = [];
    private animations: Array<any> = [];
    public static readonly activeState = 'active';
    public static readonly inactiveState = 'inactive';
    private lastComponent: string;

    activateComponent(componentName: string) {

        this.setState(componentName, Swapper.activeState);

        this.lastComponent = componentName;

    }

    deactivateComponent(componentName: string) { this.setState(componentName, Swapper.inactiveState); }

    deactivateAllComponents() { for(let swappableComponent of this.swappableComponents) { this.deactivateComponent(swappableComponent); } }

    swapTo(to: string) {

        if(!to) { throw Error('Invalid or incomplete information given in component swap parameters.'); }

        this.deactivateComponent(this.lastComponent);
        this.activateComponent(to);

    }

    registerSwappableComponents(swappableComponents : Array<any>) {

        for(let swappableComponent of swappableComponents) {
            swappableComponent['state'] = Swapper.inactiveState;
            this.swappableComponents.push(swappableComponent);
        }

    }

    registerAnimations(animations : Array<any>) {

        for(let animation of animations) {
            this.swappableComponents.push(animation);
        }

    }

    getStateFor(componentName: string) { return this.getSwappableComponentByName(componentName).state; }

    getAnimations() {

        let animations = [];

        for(let animationObj of this.animations) { animations.push(animationObj.animation); }

        return animations;

    }

    static buildSwappableComponent(component: any, name: string) {
        return { component: component, name: name };
    }

    static buildAnimation(animation: any, name: string) {
        return { animation: animation, name: name };
    }

    static buildSwapAnimation(animationHostName: string, activeStyle: any, inactiveStyle: any, activeToInactiveAnimate: string, inactiveToActiveAnimate: string):AnimationTriggerMetadata {
        return trigger(animationHostName, [
            state(Swapper.inactiveState , style(inactiveStyle) ),
            state(Swapper.activeState, style(activeStyle) ),
            transition(Swapper.inactiveState + ' => ' + Swapper.activeState, animate(inactiveToActiveAnimate)),
            transition(Swapper.activeState + ' => ' + Swapper.inactiveState, animate(activeToInactiveAnimate))
        ]);
    }

    private getSwappableComponentByName(swappableComponentName : string) {

        for(let swappableComponent of this.swappableComponents) {

            if(swappableComponent.name === swappableComponentName) {
                return swappableComponent;
            }

        }

        return null;

    }

    private getAnimationByName(animationName : string) {

        for(let animation of this.animations) {

            if(animation.name === animationName) {
                return animation;
            }

        }

        return null;

    }

    private setState(component: string, state: string) { this.getSwappableComponentByName(component).state = state; }

}