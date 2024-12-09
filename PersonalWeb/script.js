
const btn = document.querySelector('.AllButton');
const divCon = document.querySelector('.divCon');
const cross = document.querySelector('.popIcon_1');

btn.addEventListener('click', ()=> {
	divCon.style.display="block";
});
cross.addEventListener('click', ()=> {
	divCon.style.display="none";
});
