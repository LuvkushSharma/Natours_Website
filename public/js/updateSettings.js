const updateSettings = async (data , type) => {

    try {

        const url = type === 'password' 
        ? '/api/v1/users/updateMyPassword' 
        : '/api/v1/users/updateMe';

        const res = await axios ({

            method: 'PATCH',
            url,
            data

        });

        if (res.data.status === 'success') {

            showAlert ('success' , `${type.toUpperCase()} updated sucessfully!`);
        }

    } catch (err) {

       showAlert ('error' , err.response.data.message);
    }
}


// Selecting the form
const userDataForm = document.querySelector('.form-user-data');

// Selecting the password form
const userPasswordForm = document.querySelector('.form-user-password');


if (userDataForm) {

    userDataForm.addEventListener('submit' , e => {

        e.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value);

        form.append('email', document.getElementById('email').value);
        
        // instead of value we need to use files and files is an array and we need to select the first one.
        form.append('photo',document.getElementById('photo').files[0])

        // updateData (name , email);

        // ------ Lec_19 ------
        updateSettings (form , 'data');
  
    });
}


if (userPasswordForm) {

    userPasswordForm.addEventListener('submit' , async e => {

        e.preventDefault();
        
        document.querySelector('.btn--save-password').textContent = 'Updating...'

        const passwordCurrent = document.getElementById('password-current').value;

        const password = document.getElementById('password').value;

        const passwordConfirm = document.getElementById('password-confirm').value;
        
        await updateSettings ({passwordCurrent , password , passwordConfirm} , 'password');

        document.querySelector('.btn--save-password').textContent = 'Save password'

    
        // Clear the fields
        document.getElementById('password-current').value = '';

        document.getElementById('password').value = '';

        document.getElementById('password-confirm').value = '';
  
    });
}