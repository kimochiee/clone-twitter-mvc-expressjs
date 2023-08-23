const register = async (firstname, lastname, username, email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8001/api/v1/auth/register',
      data: {
        firstname,
        lastname,
        username,
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      alert('register successfully!');

      location.assign('/login');
    }
  } catch (error) {
    alert(error.response.data.msg);
  }
};

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value.trim();
    const passwordConfirm = document
      .getElementById('passwordConfirm')
      .value.trim();
    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();

    if (
      firstname &&
      lastname &&
      username &&
      email &&
      password &&
      passwordConfirm
    ) {
      if (password != passwordConfirm) {
        alert('Password not the same!');
      } else {
        register(firstname, lastname, username, email, password);
      }
    } else {
      alert('Please provide all value!');
    }
  });
}

// ---------------------------------------------------------------
const login = async (username, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8001/api/v1/auth/login',
      data: {
        username,
        password,
      },
    });

    if (res.data.status === 'success') {
      location.assign('/');
    }
  } catch (error) {
    alert(error.response.data.msg);
  }
};

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username && password) {
      login(username, password);
    } else {
      alert('Please provide all value!');
    }
  });
}

// ---------------------------------------------------------------
const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8001/api/v1/auth/logout',
    });

    if (res.data.status === 'success') {
      location.assign('/login');
    }
  } catch (error) {
    console.log(error);
  }
};

const logoutBtn = document.querySelector('.btn--logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}
