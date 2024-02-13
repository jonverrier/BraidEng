// Fluent
import {
   FluentProvider, teamsDarkTheme, makeStyles, Text
} from '@fluentui/react-components';

export const innerColumnStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',    // start layout at the top       
      alignItems: 'center'        
   },
});

export const innerColumnFooterStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      marginTop: 'auto'
   },
});