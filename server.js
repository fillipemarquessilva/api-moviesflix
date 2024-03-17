const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const users = [
    { id: 1, email: 'user1@example.com', password: 'password1' },
    { id: 2, email: 'user2@example.com', password: 'password2' }
  ];

app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Variável temporária para armazenar os filmes cadastrados
let filmes = [];

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Rota para receber os dados do filme enviado pelo formulário e armazená-los
app.post('/api/filmes', upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
    // Verifique se os arquivos foram enviados corretamente
    if (!req.files || !req.files['poster'] || !req.files['video']) {
        return res.status(400).json({ message: 'Por favor, envie arquivos de poster e vídeo' });
    }

    // Verifique se há pelo menos um arquivo para cada campo
    const posterFile = req.files['poster'][0];
    const videoFile = req.files['video'][0];
    if (!posterFile || !videoFile) {
        return res.status(400).json({ message: 'Por favor, envie arquivos de poster e vídeo' });
    }

    // Crie o objeto do filme apenas se os arquivos foram enviados corretamente
    const filme = {
        id: filmes.length + 1, // Gera um ID temporário
        titulo: req.body.titulo,
        // Modifique os caminhos para incluir o prefixo '/uploads'
        poster: 'http://' + req.get('host') + '/uploads/' + posterFile.filename,
        video: 'http://' + req.get('host') + '/uploads/' + videoFile.filename,
        descricao: req.body.descricao
    };
    filmes.push(filme);
    res.status(201).json(filme);
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
  
    // Encontra o usuário pelo email
    const user = users.find(user => user.email === email);
  
    if (!user || user.password !== password) {
      // Se o usuário não existir ou a senha estiver incorreta, retorna um erro de autenticação
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
  
    // Se o email e a senha estiverem corretos, retorna os dados do usuário (nesse caso, apenas o id)
    res.json({ id: user.id });
  });

// Rota para retornar todos os filmes cadastrados
app.get('/api/filmes', (req, res) => {
    res.json(filmes);
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
