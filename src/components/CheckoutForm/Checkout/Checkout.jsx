import React, { useState, useEffect } from 'react';
import { CssBaseline, Paper, Stepper, Step, StepLabel, Typography, CircularProgress, Divider, Button } from '@material-ui/core';
import { Link, useNavigate } from 'react-router-dom';

import { commerce } from '../../../lib/commerce';

import useStyles from './styles';
import AddressForm from '../AddressForm';
import PaymentForm from '../PaymentForm';

const steps = ['Shipping address', 'Payment details'];

const Checkout = ({ cart, order, onCaptureCheckout, error }) => {
    const [checkoutToken, setCheckoutToken] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [shippingData, setShippingData] = useState({});
    const classes = useStyles();
    // const history = useNavigate();

    const [isFinished, setIsFinished] = useState(false)

    const nextStep = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const backStep = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

    let Confirmation = () => (order.customer ? (
      <>
        <div>
          <Typography variant="h5">Thank you for your purchase, {order.customer.firstname} {order.customer.lastname}!</Typography>
          <Divider className={classes.divider} />
          <Typography variant="subtitle2">Order ref: {order.customer_reference}</Typography>
        </div>
        <br />
        <Button component={Link} variant="outlined" type="button" to="/">Back to home</Button>
      </>
    ) : isFinished ? (
      <>
      <div>
        <Typography variant="h5">Thank you for your purchase!</Typography>
        <Divider className={classes.divider} />
      </div>
      <br />
      <Button component={Link} variant="outlined" type="button" to="/">Back to home</Button>
    </>
    ) : (
      <div className={classes.spinner}>
        <CircularProgress />
      </div>
    ));
  
    if (error) {
      Confirmation = () => (
        <>
          <Typography variant="h5">Error: {error}</Typography>
          <br />
          <Button component={Link} variant="outlined" type="button" to="/">Back to home</Button>
        </>
      );
    }

    const timeOut = () => {
      setTimeout(() => {
        setIsFinished(true);
      }, 3000);  
    }

    useEffect(() => {
          const generateToken = async () => {
            try {
              const token = await commerce.checkout.generateToken(cart.id, { type: 'cart' });
              console.log(token)
    
              setCheckoutToken(token);
            } catch (error) {
              // if (activeStep !== steps.length) history.push('/');
              console.log(error);
            }
          };
    
          generateToken();
      }, [cart]);

      const test = (data) => {
        setShippingData(data);
    
        nextStep();
      };

    const Form = () => (activeStep === 0
        ? <AddressForm checkoutToken={checkoutToken} nextStep={nextStep} setShippingData={setShippingData} test={test} />
        : <PaymentForm checkoutToken={checkoutToken} nextStep={nextStep} backStep={backStep} shippingData={shippingData} onCaptureCheckout={onCaptureCheckout} timeOut={timeOut} />);
    
    return (
        <>
          <CssBaseline />
          <div className={classes.toolbar} />
          <main className={classes.layout}>
            <Paper className={classes.paper}>
              <Typography variant="h4" align="center">Checkout</Typography>
              <Stepper activeStep={activeStep} className={classes.stepper}>
                {steps.map((step) => (
                  <Step key={step}>
                    <StepLabel>{step}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {activeStep === steps.length ? <Confirmation /> : checkoutToken && <Form />}
            </Paper>
          </main>
        </>
      );
}

export default Checkout;
