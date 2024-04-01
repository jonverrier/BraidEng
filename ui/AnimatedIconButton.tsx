/*! Copyright Braid Technologies 2022 */

// React
import React, { useState, useEffect } from 'react';

// Fluent
import {
   makeStyles, 
   Button, Tooltip
} from '@fluentui/react-components';

import {
   Lightbulb24Filled
} from '@fluentui/react-icons';

const animatedGlowIcon = makeStyles({
  root: {        
     boxShadow: '0px 0px 0px 0px white;'
  },
});

export enum EAnimatedIconButtonTypes { // Must mirror MessageBarIntent, with addition of 'nothing' if you dont want to display a message. 
   kLightBulb
}

interface IAnimatedIconButtonProps {
   animate: boolean;
   icon: EAnimatedIconButtonTypes;  
   promptAnimated: string;
   promptUnamimated: string; 
}

let colors = ['#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999', '#AAAAAA', '#BBBBBB', '#CCCCCC', '#DDDDDD', '#EEEEEE', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'];

// create a forceUpdate hook
// https://stackoverflow.com/questions/46240647/how-to-force-a-functional-react-component-to-render
function useForceUpdate() {
   const [value, setValue] = useState(0); // simple integer state
   return () => setValue(value => value + 1); // update state to force render
}

export const AnimatedIconButton = (props: IAnimatedIconButtonProps) => {

   const [seq, setSeq] = useState<number>(0);
   let localSeq = seq;
   
   const animatedGlowIconClasses = animatedGlowIcon();

   // call the force update hook 
   const forceUpdate = useForceUpdate(); 

   if (props.animate) {
      useEffect(() => {
         const interval = setInterval(() => { animateColours() }, 100);
     
         return () => clearInterval(interval);
       }, []);
  }

  const animateColours = () => {
   setSeq (localSeq + 1);
   localSeq = localSeq + 1;
   if (localSeq > colors.length) {
      localSeq = 0;
      setSeq (0);
   }     
   forceUpdate ();             
} 

  return (
    <Tooltip content={props.promptAnimated} relationship="label">
       <Button icon={<Lightbulb24Filled className={animatedGlowIconClasses.root} primaryFill={colors[seq]}/>} />
    </Tooltip> 
  );
};