import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { TextField, Button, Typography, Box, Paper, Grid, Radio, RadioGroup, FormControlLabel, FormControl, Alert, Divider } from "@mui/material";
import { Check, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$9.99/mo",
    description: "Perfect for getting started with debt management",
    features: [
      "Debt tracking dashboard",
      "Basic debt payoff calculator",
      "Payment reminders",
      "Email support"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99/mo",
    description: "Advanced tools for faster debt payoff",
    features: [
      "Everything in Basic",
      "Advanced payoff strategies",
      "Debt optimization tools",
      "Priority support",
      "Custom payment schedules",
      "Detailed progress reports"
    ]
  }
];

export const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    selectedTier: "basic"
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        px: 2,
        background: 'linear-gradient(to bottom, #1E1E1E, #121212)'
      }}
    >
      <Paper 
        elevation={3}
        sx={{
          maxWidth: 1000,
          width: '100%',
          p: 4,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(136, 176, 75, 0.1)',
          borderRadius: 3
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: 'white',
            textAlign: 'center',
            mb: 3,
            fontWeight: 600
          }}
        >
          Start Your Debt-Free Journey
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Subscription Tiers */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Choose Your Plan
            </Typography>
            <RadioGroup
              name="selectedTier"
              value={formData.selectedTier}
              onChange={handleChange}
            >
              <Grid container spacing={2}>
                {subscriptionTiers.map((tier) => (
                  <Grid item xs={12} sm={6} key={tier.id}>
                    <Paper
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: formData.selectedTier === tier.id ? '#88B04B' : 'rgba(255, 255, 255, 0.1)',
                        background: formData.selectedTier === tier.id ? 'rgba(136, 176, 75, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#88B04B',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <FormControlLabel
                        value={tier.id}
                        control={
                          <Radio 
                            sx={{
                              color: '#88B04B',
                              '&.Mui-checked': {
                                color: '#88B04B',
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                              {tier.name}
                            </Typography>
                            <Typography variant="h5" sx={{ color: '#88B04B', fontWeight: 600, my: 1 }}>
                              {tier.price}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                              {tier.description}
                            </Typography>
                            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                            {tier.features.map((feature, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Check size={16} color="#88B04B" />
                                <Typography variant="body2" sx={{ color: 'white', ml: 1 }}>
                                  {feature}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </Grid>

          {/* Sign Up Form */}
          <Grid item xs={12} md={5}>
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Your Details
              </Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#88B04B',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#88B04B',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#88B04B',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#88B04B',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#88B04B',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#88B04B',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#88B04B',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#88B04B',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#88B04B',
                    },
                  },
                }}
              />

              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                endIcon={<ArrowRight />}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  bgcolor: '#88B04B',
                  color: 'white',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#7a9d43',
                  },
                }}
              >
                Start Your Journey
              </Button>

              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link href="/signin" style={{ color: '#88B04B', textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
