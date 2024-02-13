/*! Copyright Braid Technologies 2022 */

// React
import React from 'react';

import { DismissRegular } from "@fluentui/react-icons";
import {
  MessageBar,
  MessageBarActions,
  MessageBarTitle,
  MessageBarBody,
  MessageBarGroup,
  MessageBarIntent,
  Button,
  makeStyles,
} from "@fluentui/react-components";

import { EUIStrings } from './UIStrings';

const messageBarStyles = makeStyles({
  messageBarGroup: {
    display: "flex",
    flexDirection: "row"
  }
});

export enum EMainPageMessageTypes { // Must mirror MessageBarIntent, with addition of 'nothing' if you dont want to display a message. 
   kInformation = "info", 
   kWarning = "warning", 
   kError = "error", 
   kSuccess = "success",
   kNothing = "nothing"
}

interface IMainPageMessageProps {
   intent: EMainPageMessageTypes;
   text: string;
   onDismiss () : void;   
}

export const MainPageMessageRow = (props: IMainPageMessageProps) => {

  const messageClasses = messageBarStyles();
  
  let nullMessage = {intent: EMainPageMessageTypes.kNothing, text:"" };

  let displayMessage = {intent: props.intent, text: props.text };

  const dismissMessage = () =>
    { props.onDismiss() };

  if (displayMessage.intent === EMainPageMessageTypes.kNothing)
     return (<div />);

  return (
      <MessageBarGroup className={messageClasses.messageBarGroup}>
          <MessageBar key={0} intent={displayMessage.intent}>
            <MessageBarBody>
              <MessageBarTitle>{EUIStrings.kPageErrorCaption}</MessageBarTitle>
              {displayMessage.text} 
            </MessageBarBody>
            <MessageBarActions
              containerAction={
                <Button
                  onClick={() => dismissMessage()}
                  aria-label="dismiss"
                  appearance="transparent"
                  icon={<DismissRegular />}
                />
              }
            />
          </MessageBar>
      </MessageBarGroup>
  );
};