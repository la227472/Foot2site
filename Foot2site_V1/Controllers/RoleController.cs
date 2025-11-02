using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Foot2site_V1.Data;
using Foot2site_V1.Modele;

namespace Foot2site_V1.Controllers
{

    /// <summary>
    /// Controleur pour gérer les les opération CRUD des rôles.
    /// Endpoint :
    /// GET: api/Role            -> Récupère tous les rôles.
    /// GET: api/Role/{id}       -> Récupère un rôle par son ID.
    /// PUT: api/Role/{id}       -> Met à jour un rôle existant.
    /// POST: api/Role           -> Crée un nouveau rôle.
    /// DELETE: api/Role/{id}    -> Supprime un rôle par son ID.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public RoleController(Foot2site_V1Context context)
        {
            _context = context;
        }



        /// <summary>
        /// Permet de récupérer tous les rôles.
        /// </summary>
        // GET: api/Role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRole()
        {
            return await _context.Role.ToListAsync();
        }



        /// <summary>
        /// Permet de récupérer un rôle spécifique par son ID.
        /// </summary>
        /// <param name="id"></param>
        // GET: api/Role/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRole(int id)
        {
            var role = await _context.Role.FindAsync(id);

            if (role == null)
            {
                return NotFound();
            }

            return role;
        }



        /// <summary>
        /// Permet de mettre à jour un rôle existant.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="role"></param>
        /// <returns></returns>
        // PUT: api/Role/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRole(int id, Role role)
        {
            if (id != role.Id_Role)
            {
                return BadRequest();
            }

            _context.Entry(role).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(id))
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
        /// Permet de créer un nouveau rôle.
        /// </summary>
        /// <param name="role"></param>
        // POST: api/Role
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Role>> PostRole(Role role)
        {
            _context.Role.Add(role);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRole", new { id = role.Id_Role }, role);
        }



        /// <summary>
        /// Permet de supprimer un rôle par son ID.
        /// </summary>
        /// <param name="id"></param>
        // DELETE: api/Role/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Role.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            _context.Role.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        /// <summary>
        /// Permet de vérifier si un rôle existe par son ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private bool RoleExists(int id)
        {
            return _context.Role.Any(e => e.Id_Role == id);
        }
    }
}
