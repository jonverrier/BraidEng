/*! Copyright Braid Technologies 2024 */
 
// React
import React, { ChangeEvent, useState, useRef, useLayoutEffect } from 'react';

// Fluent
import { Input, InputOnChangeData, makeStyles, tokens, Textarea, TextareaProps, TextareaOnChangeData } from '@fluentui/react-components';

import { EUIStrings } from './UIStrings';
import { throwIfNull, throwIfUndefined } from '../core/Asserts';
import { EConfigNumbers, EConfigStrings } from '../core/ConfigStrings';

export interface IMessagePromptProps {

   message: string;
   onSend (message_: string) : void;   
   onChange (message_: string) : void;
}

const textFieldStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
   },
   textarea: {
      width: '100%',      
      height: '100%',
      textAlign: 'left',
      verticalAlign: 'top',
   },
   prompt: {
      textAlign: 'center',
      fontSize: '8pt',
      color: 'grey',
      width: '100%',       
   }
});

function css ( element: HTMLBaseElement, property : string) : string {
   return window.getComputedStyle( element, null ).getPropertyValue( property );
}

function cssFont (element: HTMLBaseElement) : string {
   return css (element, 'font-family');
}

export function wrapText(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null, 
   text: string,
   width: number, defaultHeight: number, defaultWidth: number): number {

      let y = 0;
      let hardLines = text.split("\n");


   // Special case if we dont have any text - allow provision for one line
   if (hardLines.length === 0)
      return defaultHeight;

   var dy = 0;

   for (var ii = 0; ii < hardLines.length; ii++) {

      var line = "";
      var words = hardLines[ii].split(" ");
      var lineWidth = 0;
      var lineHeightDelta = defaultHeight;

      for (var n = 0; n < words.length; n++) {
         var testLine = line + words[n] + " ";
         var testWidth;

         if (context) {
            let metrics = context.measureText(testLine);
            testWidth = metrics.width;
            lineHeightDelta = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;            
         }
         else {
            testWidth = defaultWidth * testLine.length;
            lineHeightDelta = defaultHeight;
         }

         // Finish if we have incrementally exceeded maxWidth, 
         // or if we only have one word so we have to any way. 
         if ((testWidth > width) || ((testWidth > width) && n === 0)) {
            line = words[n] + " ";
            y += lineHeightDelta;
            dy += lineHeightDelta;
            lineWidth = (testWidth - lineWidth) - defaultWidth / 2;
         }
         else {
            line = testLine;
            lineWidth = testWidth - defaultWidth / 2;
         }
      }

      if (context) {
         let metrics = context.measureText(line);
         testWidth = metrics.width;
         lineHeightDelta = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;            
      }
      else {
         testWidth = defaultWidth * line.length;
         lineHeightDelta = defaultHeight;
      }

      y += lineHeightDelta;
      dy += lineHeightDelta;
   }

   return dy;
}

// Ref
// https://blog.steveasleep.com/how-to-draw-multi-line-text-on-an-html-canvas-in-2021


export function calculateDyNeeded (width: number, value: string): number {

   var dyNeeded: number;
   const smallestTextForWrap = "A";

   let offScreenCanvas = new OffscreenCanvas(width, width * 10);
   throwIfUndefined (offScreenCanvas);
   let offscreenContext = offScreenCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D; 
   offscreenContext.font = EConfigStrings.kFontNameForTextWrapCalculation;

   let metrics = offscreenContext.measureText(smallestTextForWrap);
   let spaceCharWidth = metrics.width;
   let spaceCharHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent; 

   dyNeeded = wrapText(offscreenContext, value.length > 0 ? value: smallestTextForWrap,
         width,
         spaceCharHeight,
         spaceCharWidth);

   // Tidy up
   offScreenCanvas = null as any as OffscreenCanvas;
   offscreenContext = null as any as OffscreenCanvasRenderingContext2D;

   return dyNeeded;
}


export const MessagePrompt = (props: IMessagePromptProps) => {   

   const textFieldClasses = textFieldStyles();
   const ref = useRef(null);
   const [width, setWidth] = useState(0);   
   
   useLayoutEffect(() => {
      
      throwIfNull(ref.current);
      if (ref.current) {
         let dx = (ref.current as any).offsetWidth; 

         if (width !== dx) {
            setWidth(dx);         
         }
      } 
    }, []);

   function onKeyChange(ev: ChangeEvent<HTMLTextAreaElement>, data: InputOnChangeData): void {

      props.onChange (data.value);
   } 

   /*
   * looks to see if the user has Ctrl-enter, and if so processes a Commit
   * @param event - Keyboard Event
   * @param value - current text value
   */
   function onSend(event: React.KeyboardEvent<HTMLElement>, value: string) {

      var processed: boolean = false;

      switch (event.key) {

         case 'Enter':
            if (event.ctrlKey) {
               props.onSend (value);
               processed = true;
            }
            break;

         default:
            break;
      }
  
      if (processed) {
         event.stopPropagation();
         event.preventDefault();
      }
   };

   let bump = EConfigNumbers.kMessagePromptBorderAllowance;
   var dyNeeded = bump;

   if (width !== 0) 
      dyNeeded = calculateDyNeeded (width, props.message) + bump;
   

   return (<div className={textFieldClasses.root}> 
      <Textarea
         ref={ref}
         appearance="outline"
         placeholder={EUIStrings.kSendMessagePlaceholder}
         maxLength={EConfigNumbers.kMessagePromptMaxCharacters}
         textarea={{ className: textFieldClasses.textarea }}
         resize="none"
         value={props.message}
         onChange={onKeyChange}
         style={{
            height: (dyNeeded).toString() + 'px',
            width: '100%'
         }}
         onKeyDown={(e) => onSend(e, props.message)} 
         disabled={false}      
         autoFocus={true}                 
      /> 
      <div className={textFieldClasses.prompt}>{EUIStrings.kMessageTextPrompt}</div>
      </div>);
}

