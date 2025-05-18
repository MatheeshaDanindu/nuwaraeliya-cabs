import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate , useSearchParams} from "react-router-dom";
import { useEffect } from "react";
import { use } from "react";

export default function Success() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
const bookingId = searchParams.get("bookingId");


    
    useEffect(() => {
        const updateBookingStatus = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/payment/update-booking-status`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        },
                    body: JSON.stringify({bookingId, status: "confirmed" }),
                });
                if (response.ok) {
                    console.log("Booking status updated successfully");

                }else {
                    const errorData = await response.json();
                    console.error("Error updating booking status:", errorData);
                }
            }
            catch (error) {
                console.error("Error updating booking status:", error);
            }
        };
    
    if (bookingId) {
        updateBookingStatus();
    }else {
        console.error("No booking ID provided");
    }
    }
    , [bookingId]);
 
    
    
    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
            Booking Successful!
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
            Your booking has been successfully completed. Thank you for choosing us!
        </Typography>
        <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
        >
            Go to Home
        </Button>
        </Box>
    );
    }