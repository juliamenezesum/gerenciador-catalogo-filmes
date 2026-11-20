
const express = require('express');
const exphbs = require('express-handlebars');
const sequelize = require('./config/bd');
const Filme = require('./models/filme.model');
const Diretor = require('./models/diretor.model');
const Artista = require('./models/artista.model');
const methodOverride = require('method-override');
require('./models/relacionamentosModels');

const app = express();

app.use(methodOverride('_method'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('handlebars', exphbs.engine({
  defaultLayout: false,
  helpers: {
    eq: function (v1, v2) {
      return v1 == v2;
    }
  }
}));

app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  res.render('home', {
    titulo: 'Página Inicial'
  });
});

app.get('/filmes', async (req, res) => {
  const filmes = await Filme.findAll({ raw: true });
  res.render('filmes', { filmes });
});

app.get('/filmes/cadastrar', async (req, res) => {
  const diretores = await Diretor.findAll({ raw: true });
  const artistas = await Artista.findAll({ raw: true });
  res.render('cadastrarFilme', { diretores, artistas });
});

app.post('/filmes', async (req, res) => {
  const nome = req.body.nome;
  const ano = req.body.ano;
  const diretorId = req.body.diretorId;
  const artistas = req.body.artistas;

  const filme = await Filme.create({
    nome: nome,
    ano: ano,
    diretorId: diretorId,
  });

  if (artistas && artistas.length > 0)
    await filme.setArtistas(artistas);

  res.redirect('/filmes');
});

app.get('/filmes/:id/editar', async (req, res) => {
  const id = req.params.id;
  const filme = await Filme.findByPk(id, { raw: true });
  const diretores = await Diretor.findAll({ raw: true });
  const artistas = await Artista.findAll({ raw: true });
  res.render('editarFilme', { filme, diretores, artistas });
});

app.put('/filmes/:id', async (req, res) => {
  const id = req.params.id;
  const nome = req.body.nome;
  const ano = req.body.ano;
  const diretorId = req.body.diretorId;
  const artistas = req.body.artistas;

  const filme = await Filme.findByPk(id);

  filme.nome = nome;
  filme.ano = ano;
  filme.diretorId = diretorId;
  await filme.save();

  if (artistas && artistas.length > 0)
    await filme.setArtistas(artistas);

  res.redirect('/filmes');
});

app.delete('/filmes/:id', async (req, res) => {
  const id = req.params.id;
  const filme = await Filme.findByPk(id);
  await filme.destroy();
  res.redirect('/filmes');
});

app.get('/filmes/:id', async (req, res) => {
  const id = req.params.id;
  const filme = await Filme.findByPk(
    id,
    {
      include: [
        { model: Diretor, as: 'diretor' },
        { model: Artista, as: 'artistas' }
      ]
    }
  );
  res.render('detalharFilme', { filme: filme.toJSON() });
});

app.get('/diretores', async (req, res) => {
  const diretores = await Diretor.findAll({ raw: true });
  res.render('diretores', { diretores });
});

app.get('/diretores/cadastrar', (req, res) => {
  res.render('cadastrarDiretor');
});


app.post('/diretores', async (req, res) => {
  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nacionalidade = req.body.nacionalidade;

  await Diretor.create({
    nome: nome,
    anoNascimento: anoNascimento,
    nacionalidade: nacionalidade
  });

  res.redirect('/diretores');
});

app.get('/diretores/:id/editar', async (req, res) => {
  const id = req.params.id;
  const diretor = await Diretor.findByPk(id, { raw: true });
  res.render('editarDiretor', { diretor });
});

app.put('/diretores/:id', async (req, res) => {
  const id = req.params.id;
  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nacionalidade = req.body.nacionalidade;

  const diretor = await Diretor.findByPk(id);

  diretor.nome = nome;
  diretor.anoNascimento = anoNascimento;
  diretor.nacionalidade = nacionalidade;
  await diretor.save();

  res.redirect('/diretores');
});

app.delete('/diretores/:id', async (req, res) => {
  const id = req.params.id;
  const diretor = await Diretor.findByPk(id);
  await diretor.destroy();
  res.redirect('/diretores');
});

app.get('/diretores/:id', async (req, res) => {
  const id = req.params.id;
  const diretor = await Diretor.findByPk(
    id,
    { include: [{ model: Filme, as: 'filmes' }] }
  );
  res.render('detalharDiretor', { diretor: diretor.toJSON() });
});

app.get('/artistas', async (req, res) => {
  const artistas = await Artista.findAll({ raw: true });
  res.render('artistas', { artistas });
});

app.get('/artistas/cadastrar', async (req, res) => {
  const filmes = await Filme.findAll({ raw: true });
  res.render('cadastrarArtista', { filmes });
});

app.post('/artistas', async (req, res) => {
  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nomeArtistico = req.body.nomeArtistico;
  const emAtividade = req.body.emAtividade;
  const foto = req.body.foto;
  const filmes = req.body.filmes;

  const artista = await Artista.create({
    nome: nome,
    anoNascimento: anoNascimento,
    nomeArtistico: nomeArtistico,
    emAtividade: emAtividade,
    foto: foto
  });

  if (filmes && filmes.length > 0)
    await artista.setFilmes(filmes);

  res.redirect('/artistas');
});

app.get('/artistas/:id/editar', async (req, res) => {
  const id = req.params.id;
  const artista = await Artista.findByPk(id, { raw: true });
  const filmes = await Filme.findAll({ raw: true });
  res.render('editarArtista', { artista, filmes });
});

app.put('/artistas/:id', async (req, res) => {
  const id = req.params.id;
  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nomeArtistico = req.body.nomeArtistico;
  const emAtividade = req.body.emAtividade;
  const foto = req.body.foto;
  const filmes = req.body.filmes;

  const artista = await Artista.findByPk(id);

  artista.nome = nome;
  artista.anoNascimento = anoNascimento;
  artista.nomeArtistico = nomeArtistico;
  artista.emAtividade = emAtividade;
  artista.foto = foto;
  await artista.save();

  if (filmes && filmes.length > 0)
    await artista.setFilmes(filmes);

  res.redirect('/artistas');
});

app.delete('/artistas/:id', async (req, res) => {
  const id = req.params.id;
  const artista = await Artista.findByPk(id);
  await artista.destroy();
  res.redirect('/artistas');
});

app.get('/artistas/:id', async (req, res) => {
  const id = req.params.id;
  const artista = await Artista.findByPk(
    id,
    { include: [{ model: Filme, as: 'filmes' }] }
  );
  res.render('detalharArtista', { artista: artista.toJSON() });
});

app.get('/api/filmes', async (req, res) => {
  try {
    const filmes = await Filme.findAll({ raw: true });
    res.json(filmes);
  } catch (erro) {
    res.status(500).json({
      erro: 'Erro ao consultar filmes'
    });
  }
});

async function conectarBD() {
  try {
    await sequelize.sync();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  } catch (erro) {
    console.error('Erro ao conectar:', erro);
  }
}

app.listen(3000, async () => {
  await conectarBD();
  console.log('Servidor executando em http://localhost:3000');
});
