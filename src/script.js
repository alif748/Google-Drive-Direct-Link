const go = document.getElementById('go');
go.addEventListener('click', () => {
  let input = document.getElementById('input').value.split('\n')

  input.forEach(x => {
    // console.log(x);

    // axios post request
    axios.post('https://api.alif.my.id/gddl', {
        url : x
    })
    .then(function (response) {
      console.log(response);
    })

  });
});
