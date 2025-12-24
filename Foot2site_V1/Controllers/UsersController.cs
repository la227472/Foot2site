using BCrypt.Net;
using Foot2site_V1.Data;
using Foot2site_V1.Modele;
using Foot2site_V1.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Foot2site_V1.Controllers
{

    /// <summary>
    /// Controleur pour gérer les opération CRUD des utilisateurs.
    /// Endpoint :
    /// GET: api/Users            -> Récupère tous les utilisateurs.
    /// GET: api/Users/{id}       -> Récupère un utilisateur par son ID.
    /// PUT: api/Users/{id}       -> Met à jour un utilisateur existant.
    /// POST: api/Users           -> Crée un nouveau utilisateur.
    /// DELETE: api/Users/{id}    -> Supprime un utilisateur par son ID.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public UsersController(Foot2site_V1Context context)
        {
            _context = context;
        }



        /// <summary>
        /// Permet de récupérer tous les utilisateurs avec leurs rôles associés.
        /// </summary>
        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            //il faut être admin pour voir la liste des utilisateurs
            var valid = new AuthorizationServices().IsTokenValid(this.Request.Headers.Authorization.ToString(), "ADMIN");

            if (!valid)
            {
                return Unauthorized("Vous n'êtes pas autorisé à voir la liste des utilisateurs.");
            }

            return await _context.User.Include(u => u.Role).ToListAsync();
        }



        /// <summary>
        /// Permet de récupérer un utilisateur spécifique par son ID, incluant son rôle associé.
        /// </summary>
        /// <param name="id"></param>
        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {

            var user = await _context.User.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id_User == id);
            if (user == null)
            {
                return NotFound();
            }

            return user;
        }



        /// <summary>
        /// Permet de mettre à jour un utilisateur existant.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="user"></param>
        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {

            if (id != user.Id_User)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }



        /// <summary>
        /// Permet de créer un nouvel utilisateur avec un mot de passe hashé.
        /// </summary>
        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            if (string.IsNullOrWhiteSpace(user.Name) ||
                string.IsNullOrWhiteSpace(user.Firstname) ||
                string.IsNullOrWhiteSpace(user.Email) ||
                string.IsNullOrWhiteSpace(user.Password) ||
                string.IsNullOrWhiteSpace(user.Adresse) ||
                (user.Id_Role != 1 && user.Id_Role != 2))
            {
                return BadRequest(new { message = "Entrez des bonnes informations" });
            }

            // Hash du mot de passe AVANT de créer l'utilisateur
            var salt = BCrypt.Net.BCrypt.GenerateSalt();
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password, salt);

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.Id_User }, user);
        }



        /// <summary>
        /// Permet de supprimer un utilisateur par son ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            //il faut être admin pour supprimer un utilisateur
            var valid = new AuthorizationServices().IsTokenValid(this.Request.Headers.Authorization.ToString(), "ADMIN");

            if (!valid)
            {
                return Unauthorized("Vous n'êtes pas autorisé à supprimer un utilisateur.");
            }

            var user = await _context.User.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.User.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        /// <summary>
        /// Permet de vérifier si un utilisateur existe par son ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private bool UserExists(int id)
        {
            return _context.User.Any(e => e.Id_User == id);
        }



        [HttpPost("login")]
        public async Task<IActionResult> Login([FromForm] string Email, [FromForm] string password)
        {
            bool verified = false;

            var user = await _context.User.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == Email);
            if (user == null) return BadRequest("Email ou mot de passe invalide.");

            try
            {
                // Vérification BCrypt
                verified = BCrypt.Net.BCrypt.Verify(password, user.Password);
            }

            catch (BCrypt.Net.SaltParseException)
            {
                var ph = new PasswordHasher<User>();
                var res = ph.VerifyHashedPassword(user, user.Password, password);
                if (res == PasswordVerificationResult.Success || res == PasswordVerificationResult.SuccessRehashNeeded)
                {
                    user.Password = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
                    _context.User.Update(user);
                    await _context.SaveChangesAsync();
                    verified = true;
                }
            }

            if (!verified) return BadRequest("Email ou mot de passe invalide.");

            var token = new AuthorizationServices().CreateToken(user);
            return Ok(new { token });
        }
    }
}
