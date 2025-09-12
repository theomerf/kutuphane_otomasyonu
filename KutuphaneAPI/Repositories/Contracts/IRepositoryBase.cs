using System.Linq.Expressions;

namespace Repositories.Contracts
{
    public interface IRepositoryBase<T>
    {
        IQueryable<T> FindAll(bool trackChanges);
        IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression, bool trackChanges);
        void Create(T entity);
        void Remove(T entity);
        void Update(T entity);
        void UpdateRange(IEnumerable<T> entities);
        void RemoveRange(IEnumerable<T> entities);
        Task<int> CountAsync(bool trackChanges);
    }
}
