# Swapper

Swapper is a simple tool that leverages Angular 4's animation module to assist in situations when you have multiple child elements that must be swapped out from a parent view, with one component being "front-and-center" at a time.

I wrote swapper as a part of a larger project. The problem that lead to its creation arose when I was trying to find a nice way to encapsulate the component swapping animations of a set of child components that existed within a parent component.
While Angular 4's implementation does a great job of providing animation functions, I didn't like that in order to achieve this I would need to pollute my parent and child component files with a bunch of cross cutting logic to manage animation states
and blow up my decorators with animation definitions, especially for such a simple use case. So I decided to try wrapping some of this up into a centralized class that would handle a good chunk of this for me and not intrude too much on my component code. 
After several iterations and attempts using interfaces, inheritance, event emitters, moving logic to external classes and some
combination of the four. I finally found a nice solution that felt light and succinct, the key to the simplicity being the behavior of Angular 4's providers and how provider instances are scoped to components.
  
Once I got to a good point with my solution. I felt this tool may actually be useful to other developers and tinkerers out there. So I submitted my first clean and working version to NPM. Note that I will be building onto this as time goes on, as I feel I can make it even cleaner and more robust, I also developed lots of additional ideas while building this first iteration. So stay tuned by being a star gazer for this repo!  

With all that said....how the heck does this thing actually work? See Quick Start for your answer.


### Quick Start

Getting up and running with Swapper is easy. We will demonstrate with an example, say we have a parent landing component for our app with various child components to allow the user to login, register, reset password, etc. 
These are the steps we would follow to get up and going. Note that while I explain methods used in these examples, all of the provided library methods are outlined in the Methods section of this readme.

1 - Install swapper from your terminal.

```
    npm install ng4-swapper
```

You may prefer to go ahead and add this to your package.json, simply append --save-dev to the above command and you are set.

2 - Go to the landing component (parent component) ts that will be holding all of our child components and add this to import the package.

```
import { Swapper } from "ng4-swapper/swapper";
```

3 - Define the swap animation details in the animations section of your parent component decorator using buildSwapAnimation(...). The parameters here are (in order)
animation host name (used later in the host decorator property), css styling for active component, css styling for inactive animation, transition for active -> inactive, transition for inactive -> active.
Note that transitions are based on whatever transitions Angular 4 provides, as that is what is being used under the hood.

```
animations: [
        Swapper.buildSwapAnimation(
            'swapAnimation',
            {position: 'fixed', left: '0%', top: '25%', width: '100%'},
            {position: 'fixed', left: '-200%', top: '25%', width: '100%'},
            '1.5s linear',
            '1.5s linear'
        )
    ]
```

So, all we are doing here is defining an animation that will swap components into and out of view from the left side of the screen. This could also be a fade out and fade in effect, or anything else you can conceive.
The animation will transition over 1.5 seconds in a linear fashion.


4 - Add the following for host and providers in the same parent component decorator. Notice host uses the same host name you specified to
buildSwapAnimation(...).

```
    host: {'[@swapAnimation]': ''},
    providers: [ Swapper ]
```

5 - Inject swapper into the constructor, then register our swappable child components to Swapper and go ahead and swap the login component into view.
Swapping the initial component is optional, but in this particular example it makes sense to do it, as we generally want the login to be the
first component that the user is presented with.

```
export class LandingComponent {

    // Child component references.
    @ViewChild(RegistrationComponent) registrationComponent: RegistrationComponent;
    @ViewChild(PasswordRecoveryComponent) passwordRecoveryComponent: PasswordRecoveryComponent;
    @ViewChild(CodeVerificationComponent) codeVerificationComponent: CodeVerificationComponent;
    @ViewChild(PasswordResetComponent) passwordResetComponent: PasswordResetComponent;
    @ViewChild(LoadingComponent) loadingComponent: LoadingComponent;
    @ViewChild(ErrorComponent) errorComponent: ErrorComponent;
    @ViewChild(LoginComponent) loginComponent: LoginComponent;

    constructor(public swapper: Swapper) {}

    ngOnInit() {
        // Register components that can be swapped by the swapper class.
        this.swapper.registerSwappableComponents([
            'registration',
            'passwordRecovery',
            'codeVerification',
            'passwordReset',
            'loading',
            'error',
            'login'
        ]);

        this.swapper.swapTo('login');

    }

}
```

That finishes up our parent component, now we just need to inject this instance of Swapper into each of our child components. Simply go into your child component, import Swapper as done before
in the parent component and inject swapper via the constructor like so. This will enable the use of the swapTo(...) function, among other things.

```
import { Swapper } from 'ng4-swapper/swapper';

...

constructor(private swapper: Swapper) { }
```

Here is the entire registration component with Swapper integrated, notice how it uses swapTo as a means to tell Swapper that you would like to swap out 
of the current component and swap to another. In this case, we are telling swapper to bring the login component back into view once we have
successfully registered our user.

```

import { Component } from '@angular/core';
import { UserService } from '../../services/user-service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Swapper } from 'ng4-swapper/swapper';

@Component({
    selector: 'registration',
    templateUrl: 'registration.component.html',
    styleUrls: ['registration.component.scss']
})
export class RegistrationComponent {

    private firstname = '';
    private lastname = '';
    private username = '';
    private email = '';
    private password = '';
    private repeatpassword = '';
    private errortext = '';

    constructor(private userServices: UserService, private toastr: ToastsManager, private swapper: Swapper) { }

    register() {

        this.userServices.register(this.firstname, this.lastname, this.username, this.email, this.password, this.repeatpassword).subscribe(response => {

            this.errortext = '';
            this.toastr.success('User created, welcome to Dominus.', 'Success', { positionClass: 'toast-top-center' });
            this.swapper.swapTo('login');

        }, error => {

            this.errortext = error.graphQLErrors[0].message;

        });

    }

}

```

Here is the html of the landing component (our parent component) that holds all of the child components that it swaps between, notice that we simply use the animation
host as well as the swapper getStateFor() method within our animation binding, swapper will handle all the state management details for us. Nice!

```
    <login [@swapAnimation]="swapper.getStateFor('login')" #login></login>
    <registration [@swapAnimation]="swapper.getStateFor('registration')" #registration></registration>
    <password-recovery [@swapAnimation]="swapper.getStateFor('passwordRecovery')" #passwordrecovery></password-recovery>
    <password-reset [@swapAnimation]="swapper.getStateFor('passwordReset')" #passwordreset></password-reset>
    <code-verification [@swapAnimation]="swapper.getStateFor('codeVerification')" #codeverification></code-verification>
    <loading [@swapAnimation]="swapper.getStateFor('loading')" #loading></loading>
    <error [@swapAnimation]="swapper.getStateFor('error')" #error></error>
```

### Methods

```
swapTo(component: string)
```
The method that gives Swapper its purpose, this is used to tell swapper to kick the current component out of view and bring the requested component into view. Throws error if component not found within swapper instances registered components.

```
registerSwappableComponents(swappableComponents : Array<string>)
```
Takes a list of strings to register to the Swapper tool. 
This is generally run by the parent or otherwise high level component to 
initialize swapper with all the components it should 
know to manage throughout the instances lifetime.

```
getStateFor(componentName: string) { return this.getSwappableComponentByName(componentName).state; }
```
Gets the current state of a given component name. Name will be whatever name was given to the component when registered.
You will typically use this in the html to get set the swap animation state.

```
static buildSwapAnimation(animationHostName: string, activeStyle: any, inactiveStyle: any, activeToInactiveAnimate: string, inactiveToActiveAnimate: string)
```
Used to create the animation that Swapper will use to animate components in of and out of view. 

    animationHostName - The host name of the animation, to be used in the host decorator property and for the animation binding in the html.
    
    activeStyle - The style to be applied to active components.
    
    inactiveStyle - The style to be applied to inactive components.
    
    activeToInactiveAnimate - The transition to be applied when a component goes from an active state to an inactive state.
    
    inactiveToActiveAnimate - The transition to be applied when a component goes from an inactive state to an active state.
    
