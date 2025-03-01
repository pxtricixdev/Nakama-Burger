//Funcion para mostrar los paneles
function showTable(table) {
    let allTables = document.querySelectorAll('.tabla');
    let allTitles = document.querySelectorAll('.titulo')
    let allBtnBdd = document.querySelectorAll('.botones-bbdd')

    allTitles.forEach(t => t.style.display = 'none');
    allTables.forEach(t => t.style.display = 'none');
    allBtnBdd.forEach(t => t.style.display = 'none');

    //document.querySelector('.categorias').style.display = 'flex';
    //document.querySelector('.panel').style.display = 'block';

    if (table === 'productos') {
        document.getElementById('tablaProductos').style.display = 'table';
        document.getElementById('titleProductos').style.display = 'flex'
        document.getElementById('btnBbddProducts').style.display = 'flex'
    } else if (table === 'empleados') {
        document.getElementById('tablaEmpleados').style.display = 'table';
        document.getElementById('titleEmpleados').style.display = 'flex'
        document.getElementById('btnBbddEmployees').style.display = 'flex'
    } else if (table === 'clientes') {
        document.getElementById('tablaClients').style.display = 'table';
        document.getElementById('titleClients').style.display = 'flex'
    } else if (table === 'pedidos') {
        document.getElementById('tablaOrders').style.display = 'table';
        document.getElementById('titleOrders').style.display = 'flex'
    } 
    
}

// Verifica si el usuario esta autenticado o si no tiene el rol de admin
if (localStorage.getItem('isAuthenticated') !== 'true' || localStorage.getItem('role') !== 'admin') {
    window.location.href = 'logAdmin.html'; // Redirige a login
}

// Cerrar sesion
document.getElementById('btn-logout').addEventListener('click', function() {
    // Removemos los datos
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('isAuthenticated'); 
    localStorage.removeItem('role');
    // Redirige a login
    window.location.href = 'logAdmin.html';
});

//Fetch para mostrar todos los productos en la web
const urlProducts = 'http://localhost:8080/Nakama/Controller?ACTION=PRODUCTOS.FIND_ALL';

//Peticion para mostrar todos los productos
const fetchProducts = async () => {
    try {
        const result = await fetch(urlProducts);
        const data = await result.json();
        console.log('Productos obtenidos de la API:', data);
        printProducts(data);
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
    }
};
//Imprime los productos en la web
const printProducts = (products) => {
    const table = document.getElementById('tablaProductos');
    const tbody = table.querySelector('tbody');
    table.style.display = 'table';  
    tbody.innerHTML = ''; 

    products.forEach(product => {
        const {
            _idProducto,
            _nombre,
            _descripcion,
            _precioVenta,
            _estado,
            _idCategoria,
        } = product;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${_idProducto}</td>
            <td>${_nombre}</td>
            <td>${_descripcion}</td>
            <td>${_precioVenta}</td>
            <td>${_estado}</td>
            <td>${_idCategoria}</td>
            <td>
                <button type="button" class="btn-delete" data-productid="${_idProducto}">DELETE</button>
                <button class="btn-update" type="button" data-productidupdate="${_idProducto}">UPDATE</button>
            </td>
        `;

        tbody.appendChild(row);
    });

    addDeleteEventListeners(); //Llama a la funcion Delete
    addUpdateEventListeners(); //Llama a la funcion Update
};

// Funcion para agregar event listeners a los botones de "Update"
const addUpdateEventListeners = () => {
    const updateButtons = document.querySelectorAll('.btn-update');
    updateButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.getAttribute('data-productidupdate');
            await loadProductData(productId); // Carga los datos (cogiendo la id) del producto en el formulario
            console.log(productId);
            openModalUpdateProd(); 
        });
    });
};

// Funcion para cargar los datos del producto en el formulario de actualizacion 
const loadProductData = async (productId) => {
    const urlProductDetails = `http://localhost:8080/Nakama/Controller?ACTION=PRODUCTOS.FIND_BY_ID&ID_PRODUCTO=${productId}`;

    try {
        //Fetch del producto en concreto
        const result = await fetch(urlProductDetails);
        
        //Si el resultado no es el esperado
        if (!result.ok) {
            throw new Error('Network response was not ok');
        }

        const product = await result.json();

        // Verificar que el producto tiene todas las propiedades esperadas
        if (product && product._idProducto && product._nombre && product._descripcion && product._precioVenta && product._imagenRuta && product._estado && product._idCategoria) {
            document.getElementById('updateProductId').value = product._idProducto;
            document.getElementById('updateProductName').value = product._nombre;
            document.getElementById('updateProductDescription').value = product._descripcion;
            document.getElementById('updateProductPrice').value = product._precioVenta;
            document.getElementById('updateProductImage').value = product._imagenRuta;
            document.getElementById('updateProductState').value = product._estado;
            document.getElementById('updateProductCategoryId').value = product._idCategoria;
        } else {
            throw new Error("Invalid product data");
        }
    } catch (error) {
        console.error('Error al cargar datos del producto:', error);
    }
};

// Funcion para abrir el modal update producto
function openModalUpdateProd() {
    const modal = document.getElementById('update-modal-menu');
    if (modal == null) return;
    modal.classList.add('active');
}

// Funcion para cerrar el modal de update producto
function closeModalUpdateProd() {
    const modal = document.getElementById('update-modal-menu');
    if (modal == null) return;
    modal.classList.remove('active');
}

// Fetch para actualizar productos de la web y la bbdd 
const urlUpdateProducts = 'http://localhost:8080/Nakama/Controller?ACTION=PRODUCTOS.UPDATE';

//Event Listener del boton de guardar cambios cogiendo todos los campos del formulario
document.getElementById('saveBtnModal').addEventListener('click', async () => {
    const updateProductId = document.getElementById('updateProductId').value;
    const updateProductName = document.getElementById('updateProductName').value;
    const updateProductDescription = document.getElementById('updateProductDescription').value;
    const updateProductPrice = document.getElementById('updateProductPrice').value;
    const updateProductImage = document.getElementById('updateProductImage').value;
    const updateProductState = document.getElementById('updateProductState').value;
    const updateProductCategoryId = document.getElementById('updateProductCategoryId').value;

    //Creamos un nuevo objeto URLSearchParams y agregamos los valores del formulario modificado
    const formData = new URLSearchParams();
    formData.append('ID_PRODUCTO', updateProductId);
    formData.append('PRD_NOMBRE', updateProductName);
    formData.append('PRD_DESCRIPCION', updateProductDescription);
    formData.append('PRD_PRECIO_VENTA', updateProductPrice);
    formData.append('PRD_IMAGEN_RUTA', updateProductImage);
    formData.append('PRD_ESTADO', updateProductState);
    formData.append('ID_CATEGORIA_PRD', updateProductCategoryId);

    //Reliza la peticion para actualizar los productos
    try {
        const response = await fetch(urlUpdateProducts, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', //cambiamos el content-type porque si no nos da error de cors
            },
            body: formData,
        });

        if (response.ok) {
            console.log('Producto actualizado con éxito');
            closeModalUpdateProd(); 
            fetchProducts(); 
        } else {
            throw new Error('Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud de actualización:', error);
    }
});

// Funcion para borrar los productos de la web
const addDeleteEventListeners = () => {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.dataset.productid;
            console.log(`Intentando eliminar el producto con el id: ${productId}`);

            const urlProductsDelete = `http://localhost:8080/Nakama/Controller?ACTION=PRODUCTOS.DELETE&ID_PRODUCTO=${productId}`;

            try {
                const response = await fetch(urlProductsDelete, {
                    method: 'POST',
                });
                
                if (response.ok) {
                    console.log(`Producto con ID: ${productId} eliminado`);
                    event.target.closest('tr').remove(); 
                } else {
                    throw new Error(`Error al eliminar el producto con ID: ${productId}`);
                }
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
            }
        });
    });
};

fetchProducts();


//Popup formulario add productos
const openModalButtons = document.querySelectorAll('[data-modal-target="products"]');
const closeModalButtons = document.querySelectorAll('[data-close-button="products"]');
const modalMenu = document.getElementById('modal-menu');

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        openModal(modalMenu);
    });
});

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeModal(modalMenu);
    });
});

function openModal(modal) {
    if (modal == null) return;
    modal.classList.add('active');
}

function closeModal(modal) {
    if (modal == null) return;
    modal.classList.remove('active');
}

const addButton = document.getElementById('addBtnModal');

addButton.addEventListener('click', function() {
    closeModal(modalMenu);
});


// Constantes de los valores del formulario 
const productNameInput = document.getElementById('productName');
const productDescriptionInput = document.getElementById('productDescription');
const productPriceInput = document.getElementById('productPrice');
const productImageInput = document.getElementById('productImage');
const productStateElement = document.getElementById('productState');
const productCategoryIdInput = document.getElementById('productCategoryId');

// URL del endpoint para añadir productos
const urlAddProducts = 'http://localhost:8080/Nakama/Controller?ACTION=PRODUCTOS.ADD';

document.getElementById('addBtnModal').addEventListener('click', async () => {
    // Valores de los campos del formulario
    const productName = productNameInput.value;
    const productDescription = productDescriptionInput.value;
    const productPrice = productPriceInput.value;
    const productImage = productImageInput.value;
    const productState = productStateElement.value;
    const productCategoryId = productCategoryIdInput.value;

    // Creamos el objeto del producto
    const product = {
        _nombre: productName,
        _precioVenta: parseFloat(productPrice),
        _descripcion: productDescription,
        _imagenRuta: productImage,
        _estado: productState,
        _idCategoria: productCategoryId,
    };

    console.log(product);

    try {
        // Solicitud fetch para añadir el producto
        await fetch(urlAddProducts, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors',
            body: JSON.stringify(product),
        });

        //Recarga la pagina
        window.location.href = '../html/loginA001.html';

    } catch (error) {
        // Si no se ha podido realizar la solicitud mostrarmos el error
        console.error('Error al realizar la solicitud:', error);
    }
});


// Añade el producto a la tabla de productos de la web
const printProduct = (product) => {
    const table = document.getElementById('tablaProductos');
    const tbody = table.querySelector('tbody');
    table.style.display = 'table';

    const {
        PRD_NOMBRE,
        PRD_DESCRIPCION,
        PRD_PRECIO_VENTA,
        PRD_ESTADO,
        ID_CATEGORIA_PRD,
    } = product;

    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${PRD_NOMBRE}</td>
        <td>${PRD_DESCRIPCION}</td>
        <td>${PRD_PRECIO_VENTA}</td>
        <td>${PRD_ESTADO}</td>
        <td>${ID_CATEGORIA_PRD}</td>
    `;

    tbody.appendChild(row);
};

// Funcion para limpiar el formulario
const clearForm = () => {
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productState').selectedIndex = 0;
    document.getElementById('productCategoryId').value = '';
};

//Fetch de pedidos
const urlOrders = 'http://localhost:8080/Nakama/Controller?ACTION=PEDIDOS.FIND_ALL';

const fetchOrders = async () => {
    try {
        const result = await fetch(urlOrders);
        const data = await result.json();
        console.log('Pedidos obtenidos de la API:', data);
        printOrders(data);
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
    }
};

const printOrders = (orders) => {
    const table = document.getElementById('tablaOrders');
    const tbody = table.querySelector('tbody');
    table.style.display = 'table';  

    orders.forEach(order => {
        const {
            _idPedido,
            _hora,
            _fecha,
            _tlf,
            _direccion,
            _estado,
            _precio,
            _idCliente,
            _idEmpleado,
        } = order;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${_idPedido}</td>
            <td>${_fecha}</td>
            <td>${_tlf}</td>
            <td>${_direccion}</td>
            <td>${_estado}</td>
            <td>${_precio}</td>
            <td>${_idCliente}</td>
            <td>${_idEmpleado}</td>
        `;

        tbody.appendChild(row);
    });
};

fetchOrders();

//Fetch de clientes de la BBDD
const urlClients = 'http://localhost:8080/Nakama/Controller?ACTION=CLIENTES.FIND_ALL';

const fetchClients = async () => {
    try {
        const result = await fetch(urlClients);
        const data = await result.json();
        console.log('Clientes obtenidos de la API:', data);
        printClients(data);
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
    }
};

const printClients = (clients) => {
    const table = document.getElementById('tablaClients');
    const tbody = table.querySelector('tbody');
    table.style.display = 'table';  

    clients.forEach(client => {
        const {
            _idCliente,
            _nombre,
            _apellido,
            _email,
            _password,
        } = client;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${_idCliente}</td>
            <td>${_nombre}</td>
            <td>${_apellido}</td>
            <td>${_email}</td>
        `;

        tbody.appendChild(row);
    });
};

fetchClients();

//Fetch de empleados de la BBDD
const urlEmployees = 'http://localhost:8080/Nakama/Controller?ACTION=EMPLEADOS.FIND_ALL';

const fetchEmployees = async () => {
    try {
        const result = await fetch(urlEmployees);
        const data = await result.json();
        console.log('Empleados obtenidos de la API:', data);
        printEmployees(data);
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
    }
};

const printEmployees = (employees) => {
    const table = document.getElementById('tablaEmpleados');
    const tbody = table.querySelector('tbody');
    table.style.display = 'table';  

    employees.forEach(employee => {
        const {
            _idEmpleado,
            _nombre,
            _apellido,
            _email,
            _telefono,
            _rolComite,
            _salario,
            _estado,
            _idPuesto,
            _idUsuario,
        } = employee;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${_idEmpleado}</td>
            <td>${_nombre}</td>
            <td>${_apellido}</td>
            <td>${_email}</td>
            <td>${_telefono}</td>
            <td>${_rolComite}</td>
            <td>${_estado}</td>
            <td>${_idPuesto}</td>
            <td>${_idUsuario}</td>
            <td>
                <button type="button" class="btn-dlt-employee"data-employeeid="${_idEmpleado}">DELETE</button>
                <button class="btn-update-employe" type="button" data-employeeidupdate="${_idEmpleado}" id="updateEmployee">UPDATE</button>
            </td>
        `;

        tbody.appendChild(row);
    });

    addDeleteEventListenersEmployees();
    addUpdateEventListenersEmployee();
};

// Funcion para agregar event listeners a los botones de "Update Employees"
const addUpdateEventListenersEmployee = () => {
    const updateButtons = document.querySelectorAll('.btn-update-employe');
    updateButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const employeeId = button.getAttribute('data-employeeidupdate');
            await loadEmployeeData(employeeId); // Carga los datos (cogiendo la id) del empleado en el formulario
            console.log(employeeId);
            openModalUpdateEmployee(); 
        });
    });
};

// Funcion para cargar los datos del producto en el formulario de actualizacion 
const loadEmployeeData = async (employeeId) => {
    const urlEmployeeDetails = `http://localhost:8080/Nakama/Controller?ACTION=EMPLEADOS.FIND_BY_ID&ID_EMPLEADO=${employeeId}`;

    try {
        // Fetch del producto en concreto
        const result = await fetch(urlEmployeeDetails);

        // Si el resultado no es el esperado
        if (!result.ok) {
            throw new Error('Network response was not ok');
        }

        const employee = await result.json();

        //Si el empleado no tiene rol en el comite se lo asignamos vacio (control de back)
        if (!employee._rolComite) {
            employee._rolComite = ''; 
        }
      
        // Asignar valores a los campos del formulario
        document.getElementById('updateEmployeeId').value = employee._idEmpleado;
        document.getElementById('updateEmployeeName').value = employee._nombre;
        document.getElementById('updateEmployeeLastName').value = employee._apellido;
        document.getElementById('updateEmployeeEmail').value = employee._email;
        document.getElementById('updateEmployeePhone').value = employee._telefono;
        document.getElementById('updateEmployeeRole').value = employee._rolComite;
        document.getElementById('updateEmployeeSalary').value = employee._salario;
        document.getElementById('updateEmployeeState').value = employee._estado;
        document.getElementById('updateEmployeeJobId').value = employee._idPuesto;
        document.getElementById('updateEmployeeUserId').value = employee._idUsuario;
    } catch (error) {
        console.error('Error al cargar datos del empleado:', error);
    }
};


// Funcion para abrir el modal update producto
function openModalUpdateEmployee() {
    const modal = document.getElementById('modalUpdateEmployees');
    if (modal == null) return;
    modal.classList.add('active');
}

// Funcion para cerrar el modal de update producto
function closeModalUpdateEmployee() {
    const modal = document.getElementById('modalUpdateEmployees');
    if (modal == null) return;
    modal.classList.remove('active');
}

// Fetch para actualizar empleados de la web y la bbdd 
const urlUpdateEmployees = 'http://localhost:8080/Nakama/Controller?ACTION=EMPLEADOS.UPDATE';

//Event Listener del boton de guardar cambios cogiendo todos los campos del formulario
document.getElementById('saveBtnModalEmployee').addEventListener('click', async () => {
    const updateEmployeeId = document.getElementById('updateEmployeeId').value;
    const updateEmployeeName = document.getElementById('updateEmployeeName').value;
    const updateEmployeeLastName = document.getElementById('updateEmployeeLastName').value;
    const updateEmployeeEmail = document.getElementById('updateEmployeeEmail').value;
    const updateEmployeePhone = document.getElementById('updateEmployeePhone').value;
    const updateEmployeeRole = document.getElementById('updateEmployeeRole').value;
    const updateEmployeeSalary = document.getElementById('updateEmployeeSalary').value;
    const updateEmployeeState = document.getElementById('updateEmployeeState').value;
    const updateEmployeeJobId = document.getElementById('updateEmployeeJobId').value;
    const updateEmployeeUserId = document.getElementById('updateEmployeeUserId').value;

    //Creamos un nuevo objeto URLSearchParams y agregamos los valores del formulario modificado
    const formData = new URLSearchParams();
    formData.append('ID_EMPLEADO', updateEmployeeId);
    formData.append('EMP_NOMBRE', updateEmployeeName);
    formData.append('EMP_APELLIDO', updateEmployeeLastName);
    formData.append('EMP_EMAIL', updateEmployeeEmail);
    formData.append('EMP_TELEFONO', updateEmployeePhone);
    formData.append('EMP_ROL_COMITE', updateEmployeeRole);
    formData.append('EMP_SALARY', updateEmployeeSalary);
    formData.append('EMP_ESTADO', updateEmployeeState);
    formData.append('ID_PUESTO_EMP', updateEmployeeJobId);
    formData.append('ID_USUARIO_EMP', updateEmployeeUserId);

    //Reliza la peticion para actualizar los productos
    try {
        const response = await fetch(urlUpdateEmployees, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', //cambiamos el content-type porque si no nos da error de cors
            },
            body: formData,
        });

        if (response.ok) {
            console.log('Empleado actualizado con éxito');
            closeModalUpdateEmployee(); 
            fetchEmployees(); 
        } else {
            throw new Error('Error al actualizar el empleado');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud de actualización:', error);
    }
});



const addDeleteEventListenersEmployees = () => {
    const deleteButtons = document.querySelectorAll('.btn-dlt-employee');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const idEmployee = event.target.dataset.employeeid;
            console.log(`Intentando eliminar el producto con el id: ${idEmployee}`);

            const urlEmployeesDelete = `http://localhost:8080/Nakama/Controller?ACTION=EMPLEADOS.DELETE&ID_EMPLEADO=${idEmployee}`;

            try {
                const response = await fetch(urlEmployeesDelete, {
                    method: 'POST',
                });
                
                if (response.ok) {
                    console.log(`Empleado con ID: ${idEmployee} eliminado`);
                    event.target.closest('tr').remove(); 
                } else {
                    throw new Error(`Error al eliminar el empleado con ID: ${idEmployee}`);
                }
            } catch (error) {
                console.error('Error al eliminar el empleado:', error);
            }
        });
    });
};

fetchEmployees();

//Pop up añadir empleados
const openModalEmployeeButtons = document.querySelectorAll('[data-modal-target="employees"]');
const closeModalEmployeeButtons = document.querySelectorAll('[data-close-button="employees"]');
const modalEmployee = document.getElementById('modal-employee');

openModalEmployeeButtons.forEach(button => {
    button.addEventListener('click', () => {
        openEmployeeModal(modalEmployee);
    });
});

closeModalEmployeeButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeEmployeeModal(modalEmployee);
    });
});

function openEmployeeModal(modal) {
    if (modal == null) return;
    modal.classList.add('active');
}

function closeEmployeeModal(modal) {
    if (modal == null) return;
    modal.classList.remove('active');
}

const addButtonEmployee = document.getElementById('addBtnEmployee');

addButtonEmployee.addEventListener('click', function() {
    closeEmployeeModal(modalEmployee);
});


//Añadir empleados desde la web a la BBDD
// Constantes de los valores del formulario 
const employeeFirstName = document.getElementById('firstNameEmployee');
const employeeLastName = document.getElementById('lastNameEmployee');
const employeeEmail = document.getElementById('emailEmployee');
const employeePhone = document.getElementById('phoneEmployee');
const employeeRolComite = document.getElementById('rolComiteEmployee')
const employeeSalary = document.getElementById('salaryEmployee');
const employeeState = document.getElementById('employeeState');
const employeeJobId = document.getElementById('employeeJobId');
const employeeUserId = document.getElementById('employeeUserId');


// URL del endpoint para añadir empleados
const urlAddEmployees = 'http://localhost:8080/Nakama/Controller?ACTION=EMPLEADOS.ADD';

document.getElementById('addBtnEmployee').addEventListener('click', async () => {
    // Valores de los campos del formulario
    const nombre = employeeFirstName.value;
    const apellido = employeeLastName.value;
    const mail = employeeEmail.value;
    const tel = employeePhone.value;
    const rolComite = rolComiteEmployee.value;
    const salario = employeeSalary.value;
    const estado = employeeState.value;
    const jobId = employeeJobId.value;
    const userId = employeeUserId.value;

    // Creamos el objeto empleado
    const employee = {
        _nombre: nombre,
        _apellido: apellido,
        _email: mail,
        _telefono: tel,
        _rolComite: rolComite,
        _salario: salario,
        _estado: estado,
        _idPuesto: jobId,
        _idUsuario: userId,
    };

    try {
        // Solicitud fetch para añadir el empleado
        const response = await fetch(urlAddEmployees, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors',
            body: JSON.stringify(employee),
        });

        window.location.href = '../html/loginA001.html';

    } catch (error) {
        // Si no se ha podido realizar la solicitud mostrarmos el error
        console.error('Error al realizar la solicitud:', error);
    }
    
});


// Añade el producto a la tabla de empleados de la web
const printEmployee = (employee) => {
    const table = document.getElementById('tablaEmpleados');
    const tbody = table.querySelector('tbody');
    table.style.display = 'table';

    const {
        _nombre,
        _apellido,
        _email,
        _telefono,
        _rolComite,
        _salario,
        _estado,
        _idPuesto,
        _idUsuario
    } = employee;

    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${_nombre}</td>
        <td>${_apellido}</td>
        <td>${_email}</td>
        <td>${_telefono}</td>
        <td>${_rolComite}</td>
        <td>${_salario}</td>
        <td>${_estado}</td>
        <td>${_idPuesto}</td>
        <td>${_idUsuario}</td>
    `;

    tbody.appendChild(row);
};


// Funcion para limpiar el formulario
const clearFormEmployee = () => {
    document.getElementById('firstNameEmployee').value = '';
    document.getElementById('lastNameEmployee').value = '';
    document.getElementById('emailEmployee').value = '';
    document.getElementById('phoneEmployee').value = '';
    document.getElementById('salaryEmployee').value = '';
    document.getElementById('productState').selectedIndex = 0;
    document.getElementById('employeeJobId').value = '';
    document.getElementById('employeeUserId').value = '';
};


