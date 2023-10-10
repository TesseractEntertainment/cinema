import React from 'react';
import { ConnectionState } from '../components/ConnectionState';
import { ConnectionManager } from '../components/ConnectionManager';
import { Users } from '../components/Users';

/*
* The LandingPage component is the inital page that is rendered in the main view when the user visits the site.
*/
export default function LandingPage() {
  return (
    <>
        <ConnectionState />
        <ConnectionManager />
        <Users />
        <audio controls />
    </>
  );
}