const signup = async (userDetails) => {
  
    try {

      const result = await axios({
  
        method: 'POST',
        url: '/api/v1/users/signup',
        
        // Sending data 
        data : {

          name : userDetails.name,   
          email : userDetails.email,
          password : userDetails.password,
          passwordConfirm : userDetails.passwordConfirm
        }
    });
  
    if (result.data.status === 'success') {

      showAlert ('success' , 'Signed in successfully!');
       
       window.setTimeout(() => {
  
          location.assign ('/')
       } , 1500)
    }
  
    } catch (err){
        
         showAlert ('error' , err.response.data.message);
    } 
  }
  
  const signupBttn = document.querySelector('.form--signup');
  
  if (signupBttn) {
  
    signupBttn.addEventListener('submit' , e => {
  
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
    
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;
    
      signup ({name , email , password , passwordConfirm});
    
    });
    
  }
  
  