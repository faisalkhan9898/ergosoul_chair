const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_Ergosoul_key', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (triggers OTP)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      otpCode,
      otpExpires,
      isVerified: false
    });

    if (user) {
      console.log(`[SMS/Email OTP Sim] OTP for ${email}: ${otpCode}`);
      
      res.status(201).json({
        success: true,
        message: 'Registration initiated. OTP code sent to your email (simulated).',
        email: user.email
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'User is already verified.',
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    }

    if (user.otpCode !== otpCode || user.otpExpires < Date.now()) {
      res.status(400);
      throw new Error('Invalid or expired OTP code');
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // If user isn't verified, resend OTP
      if (!user.isVerified) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        console.log(`[SMS/Email OTP Sim] OTP for ${email}: ${otpCode}`);

        return res.status(403).json({
          success: false,
          needsVerification: true,
          message: 'Account not verified. A new OTP has been sent (simulated).',
          email: user.email
        });
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google Authentication (Mock / Direct registration)
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Register new user via Google directly as verified
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true
      });
    } else if (!user.googleId) {
      // Link Google ID to existing account
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          addresses: user.addresses,
          wishlist: user.wishlist
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { street, city, state, zipCode, country, phoneNumber, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country,
      phoneNumber,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/auth/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const addressId = req.params.id;
    const { street, city, state, zipCode, country, phoneNumber, isDefault } = req.body;

    const address = user.addresses.id(addressId);
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    
    // Ensure at least one address is default if list is not empty
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulated Forgot Password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User with this email does not exist.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`[Forgot Password OTP Sim] OTP for ${email}: ${otpCode}`);

    res.json({
      success: true,
      message: 'Password reset OTP has been sent to your email (simulated).',
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulated Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.otpCode !== otpCode || user.otpExpires < Date.now()) {
      res.status(400);
      throw new Error('Invalid or expired OTP code');
    }

    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.isVerified = true; // Auto verify if resets password
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  authUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  forgotPassword,
  resetPassword
};
