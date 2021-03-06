import React, { Component } from 'react';
import { withFirebase } from "./Firebase";
import { Link, withRouter } from "react-router-dom"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import LocationSearchInput from './LocationSearchInput';
import Typography from "@material-ui/core/Typography";
import axios from 'axios';

import "./css/RegisterPage.css";

class RegisterBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            password1: "",
            firstName: "",
            lastName: "",
            addressDetails: {},
            error: null
        };
    }

    onSubmit = event => {
        const {email, password, firstName, lastName, addressDetails } = this.state;
 
        console.log('RegisterPage state on submit: ', this.state);
    
        this.props.firebase.createUser(email, password)
            .then(authUser => {
                console.log('authUser: ', authUser);
        
                this.props.firebase.auth.currentUser.getIdToken()
                    .then(idToken => {
                        // console.log("idToken after createUser: ", idToken);
                        const registerData = { email, firstName, lastName, addressDetails };

                        axios.defaults.headers.common['Authorization'] = idToken;   

                        axios.post('/api/users/register', registerData)
                            .then(registerResponse => {
                                console.log('response from POST to /register', registerResponse);
                                this.props.history.push({         
                                    pathname: "/accountpage",
                                    state: {
                                      uid: authUser.user.uid,        // authUser returned from Firebase
                                    }
                                });
                            })
                            .catch(error => {
                                console.log(error.message);
                            })
                    })  
                    .catch(error => {                 // if Firebase getIdToken throws an error
                        this.setState({ 
                            email: "",
                            password: "",
                            password1: "",
                            firstName: "",
                            lastName: "",
                            error:error 
                        });
                    })
            })
            .catch(error => {                    // if Firebase createUser throws an error
                this.setState({ 
                    email: "",
                    password: "",
                    password1: "",
                    firstName: "",
                    lastName: "",
                    error:error 
                });
            });
        event.preventDefault();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSelectLocation = addressDetails => {
        this.setState({ addressDetails }, () => console.log('RegisterPage state.addressDetails:', this.state.addressDetails));
    };

    render() {
        const { email, password, password1, firstName, lastName, error } = this.state;

        const invalidCondition = firstName === '' || lastName === '' || password !== password1 || password1 === '' || email === '';

        return (
            
            <MuiThemeProvider>
                <div className="register">
                    <Typography gutterBottom variant="h5" component="h2">
                        Sign Up
                    </Typography>

                    <form onSubmit={this.onSubmit}>
                        <TextField
                            style = {{width: '65%'}}
                            hintText="First Name"
                            floatingLabelText="First name"
                            name="firstName"
                            type="text"
                            required={true}
                            value={this.state.firstName}
                            onChange={this.onChange}
                        />
                        <br/>

                            <TextField
                            style = {{width: '65%'}}
                            hintText="Last Name"
                            floatingLabelText="Last Name"
                            name="lastName"
                            type="text"
                            required={true}
                            value={this.state.lastName}
                            onChange={this.onChange}
                        />
                        <br/>

                        <TextField
                            style = {{width: '65%'}}
                            hintText="Enter your Email"
                            floatingLabelText="Email"
                            name="email"
                            type="text"
                            required={true}
                            value={this.state.email}
                            onChange={this.onChange}
                        />
                        <br/>

                        <TextField
                            style = {{width: '65%'}}
                            hintText="Enter your password"
                            floatingLabelText="Password"
                            required={true}
                            name="password"
                            type="password"
                            value={this.state.password}
                            onChange={this.onChange}
                        />
                        <br/>

                        <TextField
                            style = {{width: '65%'}}
                            hintText="Re-enter your password"
                            floatingLabelText="Re-enter password"
                            name="password1"
                            type="password"
                            required={true}
                            value={this.state.password1}
                            onChange={this.onChange}
                        />
                        <br/>

                        <div className="location-input">
                            <LocationSearchInput 
                                handleSelectLocation={this.handleSelectLocation} 
                            />
                        </div>
                        <br/>

                        <RaisedButton
                            className="register-button"
                            label="Sign Up"
                            primary={true}
                            type="submit"
                            disabled={invalidCondition}
                        />
                        <div className="sign-in-container">
                            <p>Already have an account?</p>
                            <Link to="/login" className="sign-in-link">
                                Sign In
                            </Link>
                        </div>
                        <p>By signing up, you agree to the Terms and Conditions and Privacy Policy.</p>

                        {error && <p>{error.message}</p>}
                    </form>  
                </div>
            </MuiThemeProvider>
        );
    }
}

const RegisterPage = withRouter(withFirebase(RegisterBase));

export default RegisterPage;
