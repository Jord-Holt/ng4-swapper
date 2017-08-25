import { trigger, state, animate, style, transition, AnimationTriggerMetadata } from '@angular/animations';
import { Injectable } from '@angular/core';

@Injectable()
export class Swapper {

    private swappableComponents: Array<any> = [];
    public static readonly activeState = 'active';
    public static readonly inactiveState = 'inactive';
    private lastComponent: string;

    swapTo(component: string) {

        if(!component) { throw Error('Invalid or incomplete information given in component swap parameters.'); }
        if(!this.getSwappableComponentByName(component)) { throw Error('Component requested to swap to is not registered to Swapper.'); }

        if(this.lastComponent) { this.deactivateComponent(this.lastComponent); }

        this.activateComponent(component);

    }

    registerSwappableComponents(swappableComponents : Array<string>) {

        for(let swappableComponent of swappableComponents) {
            this.swappableComponents.push(Swapper.buildSwappableComponent(swappableComponent));
        }

    }

    getStateFor(componentName: string) { return this.getSwappableComponentByName(componentName).state; }

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

    private setState(component: string, state: string) { this.getSwappableComponentByName(component).state = state; }

    private activateComponent(componentName: string) {

        this.setState(componentName, Swapper.activeState);

        this.lastComponent = componentName;

    }

    private deactivateComponent(componentName: string) { this.setState(componentName, Swapper.inactiveState); }

    private static buildSwappableComponent(name: string) {
        return { name: name, state: Swapper.inactiveState };
    }

}