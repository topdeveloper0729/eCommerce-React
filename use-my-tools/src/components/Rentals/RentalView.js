import React, { Component } from 'react';
import { withStyles } from "@material-ui/core/styles";
// import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
// import TextField from "@material-ui/core/TextField";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import CancelDialog from './CancelDialog';

import axios from 'axios';

import './css/RentalView.css';

const styles = theme => ({
    card: {
        height: "100%",
        display: "flex",
        flexDirection: "column"
    },
    cardContent: {
        flexGrow: 1,
        // maxHeight: 100,
        minHeight: 200,
        overflowY: "scroll"
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    dense: {
        marginTop: 16
    },
    menu: {
        width: 200
    },
    formControl: {
        margin: "0 15px 0 15px",
        minWidth: 90,
      },
})

class RentalView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rental: {},
            selectedRating: '',
            // userType: null,
            // selectedFile: null,
        };
    };

    componentDidMount() {
        const { rentalId, userType } = this.props.match.params;
        this.getRentalInfo(rentalId, userType);
    };

    getRentalInfo = (rentalId, userType) => {
        console.log('getRentalInfo called');
        axios.get(`/api/rentals/${userType}/rental/${rentalId}`)
            .then(rental => {
                const dateFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };   // format options for dates
                // convert dates into correct format for display:
                const formattedStartDate = this.formatDate(rental.data.StartDate, dateFormatOptions);
                const formattedEndDate = this.formatDate(rental.data.EndDate, dateFormatOptions);
                rental.data.formattedStartDate = formattedStartDate;
                rental.data.formattedEndDate = formattedEndDate;
                this.setState({
                    rental: rental.data,
                    // renterUid: tool.data.renter_uid,
                    // brand: tool.data.brand,
                    // name: tool.data.name,
                    // description: tool.data.description,
                    // price: tool.data.price,
                    // available: tool.data.available,
                    // rented: tool.data.rented,
                    // rating: tool.data.rating,
                }, () => { 
                    console.log("RentalView state.rental after getRentalInfo:", this.state.rental);
                });
            })
            .catch(error => {
                console.log(error.message);
            })
    };

    formatDate = (dateData, dateFormatOptions) => {
        const date = new Date(dateData);
        // console.log(date);
        const formattedDate = date.toLocaleDateString("en-US", dateFormatOptions); 
        // console.log(formattedDate);
        return formattedDate;
    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleSubmitRating = event => {
        const { userType, rentalId } = this.props.match.params;
        const data = {
            rating: this.state.selectedRating
        }
        axios.put(`api/rentals/${userType}/rental/updaterating/${rentalId}`, data)
            .then(response => {
                console.log('response from /updaterating: ', response);
            })
            .catch(error => {
                console.log(error.message);
            }) 
    }

    cancelRental = () => {
        const { userType, rentalId } = this.props.match.params;
        let cancelStatus = null;
        if (userType === 'owner') {
            cancelStatus = 'cancelledByOwner';
        } else if (userType === 'renter') {
            cancelStatus = 'cancelledByRenter';
        }
        
        const updateData = { rentalId, status: cancelStatus };
        axios.put(`/api/rentals/updatestatus`, updateData)
        .then(response => {
            console.log('resonse from cancel request: ', response);
            let { rental } = this.state;
            rental.Status = response.data;
            this.setState({ rental }, () => console.log(this.state));
        })
        .catch(error => {
            this.setState({ error: error.message });
        })
    };

    renderRatingContainer = () => {
        const { rental } = this.state;
        const { userType, rentalId } = this.props.match.params;
        const { classes } = this.props;

        let rating = null;
        if (userType === 'owner') {
            rating = 'ratingFromOwner';
        } else if (userType === 'renter') {
            rating = 'ratingFromRenter';
        }
        
        console.log('renderRatingContainer called');
        console.log('rental: ', rental);
        console.log('userType: ', userType);
        console.log('rating: ', rating);
        console.log('rental[rating]: ', rental[rating]);

        if (rental.Status  === 'completed' && !rental[rating]) {
            return (
                <div className="rating-container">
                    <Typography variant="h6">
                        Rate this rental experience:
                    </Typography>

                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="rating-select">Rating</InputLabel>
                        <Select
                            value={this.state.selectedRating}
                            onChange={this.handleChange}
                            inputProps={{
                                name: 'selectedRating',
                                id: 'rating-select'
                            }}
                        >
                            <MenuItem value={1}>1 Star</MenuItem>
                            <MenuItem value={2}>2 Stars</MenuItem>
                            <MenuItem value={3}>3 Stars</MenuItem>
                            <MenuItem value={4}>4 Stars</MenuItem>
                            <MenuItem value={5}>5 Stars</MenuItem>
                        </Select>
                    </FormControl>
                    <Button onClick={this.handleSubmitRating} variant="outlined" color="primary">
                        Submit
                    </Button>
                </div>
            ) 
        } else if (rental.Status  === 'completed' && rental[rating] >= 0 ) {
            return (
                <Typography variant="h6">
                    You rated this rental {rental[rating]} Stars
                </Typography>
            )
        }
    }

    render() {
        const { rental } = this.state;
        const { userType, rentalId } = this.props.match.params;
        const { classes } = this.props;

        return (
            <div className="page-container">

                <div className="title">
                    {userType === 'renter' &&
                        <Typography
                            variant="h6"
                        >
                            You booked this rental
                        </Typography>
                    }
                    {userType === 'owner' &&
                        <Typography
                            variant="h6"
                        >
                            This is your tool
                        </Typography>
                    }
                </div>

                <div className="main-container">

                    <div className="left-container">
                        <div className="image-container">
                            {rental.ToolImageURL ? (
                                <img src={rental.ToolImageURL} alt="tool"/>
                            ) : (
                                ''
                            )}
                        </div>

                        <div className="tool-info">
                            <Typography variant="h6">
                                {rental.ToolBrand}{' '}{rental.ToolName}
                            </Typography>

                            {userType === 'renter' &&
                                <Typography variant="h6">
                                    Owner: {rental.OwnerFirstName}{' '}{rental.OwnerLastName}
                                </Typography>
                            }
                        </div>

                    </div>

                    <div className="right-container">
                        <div className="rental-info">
                            {userType === 'owner' &&
                                <Typography variant="h6">
                                    Renter: {rental.RenterFirstName}{' '}{rental.RenterLastName}
                                </Typography>
                            }
                            <br/>
                            <Typography variant="h6">
                                {rental.formattedStartDate}{' - '}{rental.formattedEndDate}
                            </Typography>
                            <br/>
                            
                            {rental.Status === 'upcoming' && 
                                <Typography variant="h6">
                                    Status: Upcoming
                                </Typography>
                            }
                            {rental.Status === 'completed' && 
                                <Typography variant="h6">
                                    Status: Completed
                                </Typography>
                            }
                            {rental.Status === 'cancelledByRenter' && 
                                <Typography variant="h6">
                                    Status: Cancelled by Renter
                                </Typography>
                            }
                            {rental.Status === 'cancelledByOwner' && 
                                <Typography variant="h6">
                                    Status: Cancelled by Owner
                                </Typography>
                            }
                            <br/>
                            <Typography variant="h6">
                                Daily rental price: ${rental.DailyRentalPrice}
                            </Typography>
                        </div>

                        <div className="rental-management">
                            {/* Rental rating */}
                            {this.renderRatingContainer()}

                            {/* Rental review */}

                            {(rental.Status === 'upcoming' || rental.Status === 'active') &&
                                <CancelDialog confirmCancelRental={this.cancelRental}/>
                            }

                        </div>
                        {/* end rental-management */}
                    </div>
                    {/* end right-container */}
                </div> 
                {/* end main-container */}
            </div>
            // end page-container 
        )
    }
}

export default withStyles(styles)(RentalView);