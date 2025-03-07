# StreamNest Backend

A **scalable backend API** for managing video streaming, authentication, and user interactions, built using **Node.js, Express, and MongoDB**. 

## 🚀 Features

- **User Authentication**: Secure **JWT-based authentication** with role-based access control.
- **Video Management**: Upload, retrieve, and manage videos.
- **Watch History**: Track user watch history and interactions.
- **Likes & Playlists**: Users can like videos and create playlists.
- **MongoDB Aggregation**: Optimized queries for better performance.
- **File Uploads**: **Cloudinary integration** for media storage.

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcrypt
- **Storage**: Cloudinary (for video uploads)
- **API Testing**: Postman
- **Other Tools**: Multer (for file handling), dotenv (for environment variables)

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Aniketsingla8/Backend-Project.git
   cd Backend-Project
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     PORT=8000
     MONGO_URI=your_mongodb_connection_string
     CORS_ORIGIN=*
     ACCESS_TOKEN_SECRET=your_access_token_secret
     ACCESS_TOKEN_EXPIRY=1d
     REFRESH_TOKEN_SECRET=your_refresh_token_secret
     REFRESH_TOKEN_EXPIRY=10d
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```

4. **Start the server:**
   ```sh
   npm start
   ```

## 📌 API Endpoints

### **Authentication**
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| POST   | `/api/auth/signup`  | Register a new user     |
| POST   | `/api/auth/login`   | Login and get JWT token |

## 🚀 Future Enhancements
- **AWS S3 Integration** for video storage
- **WebSockets for real-time interactions**
- **Video Streaming Optimization**

## 💡 Contributing
Feel free to submit issues or pull requests! 🙌

---

🔗 **GitHub Repository:** [Backend-Project](https://github.com/Aniketsingla8/Backend-Project)
