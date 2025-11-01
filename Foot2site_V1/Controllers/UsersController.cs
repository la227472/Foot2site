using Foot2site_V1.Data;
using Foot2site_V1.Modele;
using Foot2site_V1.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol.Plugins;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection.Metadata;
using System.Threading.Tasks;

namespace Foot2site_V1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public UsersController(Foot2site_V1Context context)
        {
            _context = context;
        }


        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUser()
        {
            return await _context.User
                .Include(u => u.Role)
                .ToListAsync();
        }


        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.User.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }


        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(string Name, string Firstname, string Email, string Password, string Adresse, int Id_Role)
        {
            if (string.IsNullOrWhiteSpace(Name) ||
                string.IsNullOrWhiteSpace(Firstname) ||
                string.IsNullOrWhiteSpace(Email) ||
                string.IsNullOrWhiteSpace(Password) ||
                string.IsNullOrWhiteSpace(Adresse) ||
                (Id_Role != 1 && Id_Role != 2))
            {
                return BadRequest(new { message = "Entrez des bonnes informations" });
            }

            // Hash du mot de passe AVANT de créer l'utilisateur
            var salt = BCrypt.Net.BCrypt.GenerateSalt();
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(Password, salt);

            var user = new User
            {
                Name = Name,
                Firstname = Firstname,
                Email = Email,
                Password = hashedPassword,
                Adresse = Adresse,
                Id_Role = Id_Role
            };

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.Id_User }, user);
        }


        // PUT: api/Users/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, string Name, string Firstname, string Email, string Password, string Adresse, int Id_Role)
        {
            if (Id_Role != 1 && Id_Role != 2)
            {
                return BadRequest(new { message = "Id_Role doit être 1 (admin) ou 2 (utilisateur)." });
            }

            var user = await _context.User.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Name = Name;
            user.Firstname = Firstname;
            user.Email = Email;
            user.Password = Password;
            user.Adresse = Adresse;
            user.Id_Role = Id_Role;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExistsByID(id))
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


        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.User.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Utilisateur non trouvé." });
            }

            _context.User.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("/login")]
        public async Task<ActionResult<LoginResponse>> Login([FromForm] string Email, [FromForm] string password)
        {
            var userExists = UserExists(Email, password);
            if (userExists == null)
            {
                return BadRequest(new { message = "Email ou mot de passe incorrect" });
            }
            else
            {
                var token = new AuthorizationServices().CreateToken(userExists);
                return Ok(new LoginResponse
                {
                    Token = token,
                    Email = userExists.Email // ou d'autres infos utiles
                });
            }
        }

        private User UserExists(string Email, string password)
        {
            var user = _context.User
                .Include(u => u.Role)
                .FirstOrDefault(u => u.Email == Email);
            if (user != null && BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                return user;
            }
            return null;
        }

        private bool UserExistsByID(int id)
        {
            return _context.User.Any(e => e.Id_User == id);
        }
    }
}
