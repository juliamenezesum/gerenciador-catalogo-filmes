
import { useState, useEffect } from 'react'

function App() {
  const [filmes, setFilmes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function buscarFilmes() {
      try {
        const resposta = await fetch('http://localhost:3000/api/filmes')

        if (!resposta.ok) {
          throw new Error('Erro ao consultar os filmes')
        }

        const dados = await resposta.json()
        setFilmes(dados)

      } catch (erro) {
        setErro('Não foi possível carregar os filmes.')
        console.error(erro)
      } finally {
        setCarregando(false)
      }
    }

    buscarFilmes()
  }, [])

  return (
    <div>
      <h1>Lista de Filmes</h1>

      {carregando && <p>Carregando filmes...</p>}

      {erro && <p>{erro}</p>}

      {!carregando && !erro && filmes.length === 0 && (
        <p>Nenhum filme cadastrado.</p>
      )}

      <ul>
        {filmes.map((filme) => (
          <li key={filme.id}>
            {filme.titulo || filme.nome}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
