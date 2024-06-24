document.addEventListener("DOMContentLoaded", () => {
    const socket = io(); // Conectar al servidor Socket.io al cargar la página

    socket.on('connect', () => {
        console.log('Conectado al servidor');
    });

    // Manejar la recepción de los turnos actuales desde el servidor
    socket.on('turnos-actuales', (turnos) => {
        const pendientesContainer = document.getElementById('turnos-pendientes');
        const enCursoContainer = document.getElementById('turnos-en-curso');

        pendientesContainer.innerHTML = '';
        enCursoContainer.innerHTML = '';

        turnos.forEach(turno => {
            const turnoElement = document.createElement('div');
            turnoElement.textContent = `Turno: ${turno.cod_reserva} - Estado: ${turno.status}`;

            const callButton = document.createElement('button');
            callButton.textContent = 'Llamar Turno';
            callButton.onclick = async () => {
                callButton.disabled = true; // Desactivar el botón para prevenir múltiples clics
                await callTurn(turno.cod_reserva);
                callButton.disabled = false; // Habilitar el botón después de la llamada
            };

            turnoElement.appendChild(callButton);

            if (turno.status === 'pendiente') {
                pendientesContainer.appendChild(turnoElement);
            } else if (turno.status === 'en_curso') {
                enCursoContainer.appendChild(turnoElement);
            }
        });
    });

    // Manejar la recepción de un nuevo turno creado desde el servidor
    socket.on('nuevo-turno', (turno) => {
        alert(`Nuevo turno creado: ${turno.codigoReserva}`);
        // Puedes actualizar la lista de turnos pendientes aquí si lo deseas
    });

    // Manejar la recepción de la llamada a un turno desde el servidor
    socket.on('turn-called', (data) => {
        alert(`Turno ${data.N_ticket} llamado`);
    });

    // Función para llamar a un turno
    async function callTurn(N_ticket) {
        try {
            const response = await fetch('/call-turn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ N_ticket })
            });

            const data = await response.json();
            if (data.status === 'OK') {
                alert('Turno llamado correctamente');
            } else {
                alert('Error al llamar el turno');
            }
        } catch (error) {
            console.error('Error al llamar el turno:', error);
            alert('Error al llamar el turno');
        }
    }
});
