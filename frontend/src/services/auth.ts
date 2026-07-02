import { Amplify } from 'aws-amplify';
import { signIn, signOut, signUp, getCurrentUser, confirmSignUp } from 'aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

export { signIn, signOut, signUp, getCurrentUser, confirmSignUp };
