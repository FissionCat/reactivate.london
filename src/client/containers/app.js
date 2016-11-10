import React, { Component, PropTypes } from 'react'
import styled from 'styled-components'
import { white, navy } from '../styles/colors'

import Cover from '../components/cover'
import Timeline from '../components/timeline'
import Speakers from '../components/speakers'
import Footer from '../components/footer';
import Container from '../components/base/container';

const Background = styled.div`
  position: relative;
  background-color: ${navy};
  color: ${white};
  overflow: auto;
  min-height: 100vh;
  z-index: 0;
`;

export default class App extends Component {


  render() {
    return (
      <Background>
        <Cover/>
        <Timeline/>
        <Speakers/>
        <Footer/>
      </Background>
    )
  }
}
