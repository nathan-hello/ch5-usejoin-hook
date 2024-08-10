import { useState, useEffect } from 'react';
import { CrComLib } from "@pepperdash/ch5-crcomlib-lite";

/**
@param signalType          - "boolean" | "number" | "string". This maps to Crestron words digital, analog, and serial respectively.
@param joinNumber          - Join number that is programmed into the processor's program (SMW or Simpl#).
@param readOnly            - If true, only return the state variable without a publish function.
@returns [state, pubState] - The feedback and a function to publish a new value to the processor. 
@returns state             - If readOnly is true, only state is returned.  

The state variable is updated by the processor. It only updates when the processor sends the feedback to the join number.
Because of this, you should not mutate the state variable. Only publish new information to the processor and let your
program determine the state through the feedback.

The publish has a signature of (v: boolean | number | string) => void.  
As a convention, name the publish function something like pubState instead of setState.
When you use pubState(true), this is the rising edge of the digital signal. If you want the button to have a falling edge
to signify the button is no longer being pressed, make sure you do this. E.g.
```tsx
    <Button
      onTouchStart={() => pubState(true)}
      onTouchEnd={() => pubState(false)}
      onTouchCancel={() => pubState(false)}
    >...</Button>
```
Without a falling edge, the processor will constantly read the join number as high. Make sure your UI logic takes this into account.

The connection to the join number happens over the IP table. There is no IP table information in the Javascript CrCromLib library.
To connect to the processor using this Javascript, go to 
SMW -> Central Control Modules (e.g. CP4) -> Device (e.g. TS1070) -> F6 (Configure Device...) -> IP Net Address
And put the IP ID (e.g. 03) in the dropdown and set the radio button to IP ID instead of "Remap this IP ID at program upload".  
Then make an entry in your device's IP Table over the same IP ID back to the processor.
This means that the useJoin doesn't work at all unless if you're on and XPanel or phyiscal touchpanel device that is connected
to a processor. A method of mocking a processor is required for testing but is not implemented yet.
*/
export function useJoin<T extends keyof SignalMap>(signalType: T, joinNumber: number, readOnly: true): RJoinReadOnly<T>;
export function useJoin<T extends keyof SignalMap>(signalType: T, joinNumber: number, readOnly?: false,): RJoin<T>;
export function useJoin<T extends keyof SignalMap>(signalType: T, joinNumber: number, readOnly?: boolean,): RJoin<T> | RJoinReadOnly<T> {
    const join = joinNumber.toString();
    const [state, setState] = useState<SignalMap[T]>(getInitialState(signalType));

    useEffect(() => {
        // "as any" because subscribeState doesn't like the types. it's fine.
        const id = CrComLib.subscribeState(signalType, join, setState as any);
        return () => {
            CrComLib.unsubscribeState(signalType, join, id);
        };
    }, [join, signalType, setState]);

    if (readOnly) { return state; }

    const pubState = (v: SignalMap[T]) => {
        CrComLib.publishEvent(signalType, join, v);
    };
    return [state, pubState];

}

function getInitialState<T extends keyof SignalMap>(signalType: T): SignalMap[T] {
    switch (signalType) {
        case "boolean":
            return false as SignalMap[T];
        case "number":
            return 0 as SignalMap[T];
        case "string":
            return "" as SignalMap[T];
    }
}

type SignalMap = {
    "boolean": boolean,
    "number": number,
    "string": string,
};
export type RJoin<T extends keyof SignalMap> = [SignalMap[T], (value: SignalMap[T]) => void];
export type RJoinReadOnly<T extends keyof SignalMap> = SignalMap[T];
