const urlBase = 'http://localhost:4000/api'
const resultadoModal = new bootstrap.Modal(document.getElementById('modalMensagem'))

async function carregaPrestadores(){
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = '';
    await fetch(`${urlBase}/prestadores`, {
        method: 'GET',
        header: {
            'Contet-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        data.forEach(prestador => {
            tabela.innerHTML += `
            <tr>
                <td>${prestador.razao_social}</td>
                <td>${prestador.nome_fantasia}</td>
                <td>${prestador.cnae_fiscal}</td>
                <td>${new Date(prestador.data_inicio_atividade).toLocaleDateString()}</td>
                <td>${prestador.localizacao.coordinates[0]} / ${prestador.localizacao.coordinates[1]} </td>
                <td>
                    <div class="d-flex justify-content-center">
                        <button class='btn btn-primary btn-sm' onclick="editarPrestador('${prestador._id}')">Editar&nbsp;&nbsp;✏</button>
                    </div><br>
                    <div class="d-flex justify-content-center">
                        <button class='btn btn-danger btn-sm' onclick="removePrestador('${prestador._id}')">Excluir&nbsp;🗑</button>
                    </div>
                </td>
            </tr>
            `
        })
    })
}
async function removePrestador(id){
    if (confirm('Será excluido permanentemente. Tem certeza disso?')) {
        await fetch(`${urlBase}/prestadores/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.deletedCount > 0) {
                carregaPrestadores()
            }
        })
        .catch(error => {
            document.getElementById('mensagem').innerHTML = `Erro ao remover o prestador: ${error.message}`
            resultadoModal.show()
        })
    }
}
document.getElementById('formPrestador').addEventListener('submit', function(event){
    event.preventDefault()
    let prestador = {}
    prestador = {
        "cnpj": document.getElementById('cnpj0').value,
        "razao_social": document.getElementById('razao-social1').value,
        "nome_fantasia": document.getElementById('nome-fantasia2').value,
        "cnae_fiscal": document.getElementById('cnae13').value,
        "data_inicio_atividade": document.getElementById('data-de-inicio-da-atividade15').value,
        "localizacao": {
            "type": "Point",
            "coordinates": [document.getElementById('latitude10').value,
                            document.getElementById('longitude11').value]
        },
        "cep": document.getElementById('cep4').value,
        "endereco": {
            "logradouro": document.getElementById('logradouro5').value,
            "complemento": document.getElementById('complemento8').value,
            "bairro": document.getElementById('bairro6').value,
            "localidade": document.getElementById('localidade7').value,
            "uf": document.getElementById('unidade-de-federacao9').value,

        }
    }
    salvaPrestador(prestador)
})
async function salvaPrestador(prestador){
    await fetch(`${urlBase}/prestadores`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(prestador)
    })
    .then(response => response.json())
    .then(data => {
        if (data.acknowledged) {
            alert('Prestador cadastrado.')
            document.getElementById('formPrestador').reset()
            carregaPrestadores()
        } else if(data.errors) {
            const errorMessages = data.errors.map(error => error.msg).join('\n')
            document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${errorMessages}</span>`
            resultadoModal.show()
        }
    })
}